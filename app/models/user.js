var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var _ = require('lodash');
var BaseModel = require('./base-model');
var Checkit = require('../../config/checkit');
var Mailchimp = require('../../config/mailchimp');

var verificationMailer = require('../mailers/verification-mailer');

var rootUrl = require('../../config/environments/'+process.env.NODE_ENV).rootUrl;
var UserConstants = require('../constants/user');

var User = BaseModel.extend({
  tableName: 'users',

  initialize: function() {
    this.on('creating', this.validateCreate);
  },

  validateCreate: function(user, attributes, options) {
    var userValidation = new Checkit({
      email: ['email', 'unique:users:email']
    })
    return userValidation.run(user.attributes);
  },

  // user methods
  verifyPassword: Promise.method(function(password) {
    return bcrypt.compareAsync(password, this.get('password'));
  }),

  setPassword: Promise.method(function(password) {
    if(!User._validatePassword(password)) throw new Error('Invalid Password');
    var self = this;
    return User.hashPassword(password)
    .then(function(hashedPass) {
      return self.save({password: hashedPass}, {patch: true});
    });
  }),

  resetPassword: Promise.method(function() {
    var self = this;
    var tempPassword = Math.random().toString(36).substring(2, 12);
    return self.setPassword(tempPassword)
    .then(function() {
      return verificationMailer.sendRecoverPasswordEmail({
        email: self.get('email'),
        password: tempPassword,
        firstName: self.get('firstName')
      });
    });
  }),

  addUserToMailingList: Promise.method(function(groupCategory) {
    return Mailchimp.addUserToList(this.get('email'), groupCategory, this.get('firstName'), this.get('lastName'));
  }),

  sendVerificationEmail: Promise.method(function() {
    var self = this;
    return User.hashVerificationKey(this.get('email'))
    .then(function(verificationHash) {
      console.log(verificationHash);
      var params = {
        email: self.get('email'),
        firstName: self.get('firstName'),
        verificationLink: rootUrl + '/api/verify/'+self.get('id')+'?verification='+verificationHash
      };
      return verificationMailer.sendVerificationEmail(params);
    });
  }),

  checkVerification: Promise.method(function(hashParam) {
    var self = this;
    return User.hashVerificationKey(this.get('email'))
    .then(function(verificationHash) {
      return bcrypt.compareAsync(verificationHash, hashParam)
      .then(function() {
        return self.save({active: UserConstants.USER_VERIFIED});
      });
    });
  })

    // Private methods
    
}, {
  // User methods
  hashPassword: Promise.method(function(password) {
    return bcrypt.genSaltAsync(10)
    .then(function(salt) {
      return bcrypt.hashAsync(password, salt)
      .catch(function(err) {
        console.log(err);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  }),

  hashVerificationKey: Promise.method(function(email) {
    return bcrypt.genSaltAsync(8)
    .then(function(salt) {
      return bcrypt.hashAsync('secret' + email+ 'supersecret', salt)
      .catch(function(err) {
        console.log(err);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  }),

  login: Promise.method(function(email, password) {
    if(!email || !password) throw new Error('Email and password are both required');
    return User.forge({email: email.toLowerCase().trim()}).fetch({require: true}).then(function(user) {
      if(user.get('active') === UserConstants.USER_UNVERIFIED) throw new Error('notVerified');
      return user.verifyPassword(password)
      .then(function(passMatch) {
        if(passMatch) {
          return user;
        } else {
          throw new Error('invalidPassword');
        }
      });
    });
  }),

  register: Promise.method(function(attrs) {
    attrs = this._permittedParams(attrs);
    attrs.email = attrs.email.toLowerCase().trim();
    if(!attrs.email || !attrs.password) throw new Error('Email and Password required');
    if(!this._validatePassword(attrs.password)) throw new Error('Invalid password');
    return this.hashPassword(attrs.password)
    .then(function(hashedPass) {
      attrs.password = hashedPass;
      return User.forge({email: attrs.email.toLowerCase().trim()}).fetch().then(function(user) {
        if(user !== null && user.get('password') === null) {
          // user is coming from the mailing list, so assign the details to the existing user and save
          user.set({password: hashedPass,
                    firstName: attrs.firstName,
                    lastName: attrs.lastName,
                    mailingList: attrs.mailingList });
        } else {
          // otherwise create new user and save. If the email already exists Checkit will discover and raise an error
          user = User.forge(attrs);
        }
        return user.save()
        .then(function(user) {
          if(user.get('mailingList')) user.addUserToMailingList('registeredUser');
          user.sendVerificationEmail();
          return user;
        });
      });
      
    })
    .catch(Checkit.Error, function(err) {
      if(err.get('email')) {
        // Checkit email error
        console.log(err.get('email').message);
        throw new Error(err.get('email').message);
      } else {
        // Database error
        console.log(err);
        throw new Error('Error registering new profile');
      }
    });
  }),

  registerForMailingList: Promise.method(function(email) {
    var attrs = {email: email};
    return User.forge(attrs).save()
    .then(function(user) {
      user.addUserToMailingList('mailingList');
      return user;
    });
  }),

  // private
    _permittedParams: function(attrs) {
      return _.pick(attrs, 'firstName', 'lastName', 'email', 'password', 'mailingList');
    },

    _validatePassword: function(password) {
      if(password.length < 8) return false;
      return true;
    },
});

module.exports = User;