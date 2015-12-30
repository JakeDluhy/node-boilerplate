/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var _ = require('lodash');

/*
  ENVIRONMENT CONFIG
*/
var rootUrl = require('../../config/environments/'+process.env.NODE_ENV).rootUrl;

/*
  EXTERNAL MODULES
*/
var bookshelf = require('../../config/database');
var BaseModel = require('./base-model');
var Checkit = require('../../config/checkit');
var Mailchimp = require('../../config/mailchimp');
var verificationMailer = require('../mailers/verification-mailer');
var UserConstants = require('../constants/user');

/*
  MODELS
*/
var PasswordReset = require('./password-reset');

/*
  USER MODEL
*/
var User = BaseModel.extend({
  tableName: 'users',

  initialize: function() {
    this.on('creating', this.validateCreate);
    this.on('saving', this.checkMailingListSignup);
  },

  // CALLBACKS
  /*
    @callback validateCreate
    Check if the model is valid

    @returns a Promise that 
    resolves if it passes
    { email: unique }
    rejects otherwise
  */
  validateCreate: function(user, attributes, options) {
    var userValidation = new Checkit({
      email: ['email', 'unique:users:email']
    });
    return userValidation.run(user.attributes);
  },

  /*
    @callback checkMailingListSignup
    While saving a user, check whether they need to be removed or added to the mailing list

    @if the user attribute for mailing list is true and it wasn't before
    => add to mailing list
    @if the user attributes for mailing list is false and it was true
    => remove from mailing list
  */
  checkMailingListSignup: function(user, resp) {
    var mailingListType = (user.get('password') === undefined ? 'mailingList' : 'registeredUser');

    if(user.get('mailingList') === 'true' && (user.previousAttributes().mailingList === false || user.isNew())) {
      return user.addUserToMailingList(mailingListType);
    } else if(user.get('mailingList') === 'false' && user.previousAttributes().mailingList === true) {
      return user.removeUserFromMailingList();
    }
  },

  // RELATIONS
  passwordReset: function() {
    return this.hasOne('PasswordReset');
  },

  
  /* ------------------------------------
              user methods
  ------------------------------------ */

  /*
    @method verifyPassword
    Use bcrypt to compare the provided password to the actual password

    @param {string} password - the provided password to check against the DB

    !important
    @returns a Promise that 
    RESOLVES to true if the passwords match and false if they don't
    REJECTS only if there is an error comparing passwords

    *Note that the method __should__ always resolve, even if the passwords don't match. It resolves to a true/false value
  */
  verifyPassword: Promise.method(function(password) {
    console.log(this.get('password'));
    return bcrypt.compareAsync(password, this.get('password'));
  }),

  /*
    @method setPassword
    Hash the provided password and set it as the user's password

    @param {string} password - the unhashed password to hash and store

    @returns a Promise that
    RESOLVES if the save is successful
    REJECTS if there is a problem saving or hashing the password
  */
  setPassword: Promise.method(function(password) {
    if(!User._validatePassword(password)) throw new Error('Invalid Password');
    var self = this;
    return User.hashPassword(password)
    .then(function(hashedPass) {
      return self.save({password: hashedPass}, {patch: true});
    });
  }),

  /*
    @method resetPassword
    Create a PasswordReset model for the user, and send that code in an email to the user's email
    This PasswordReset will time out after an hour (logic in the password reset model)

    @returns a Promise that 
    RESOLVES if sending the email is successful
    REJECTS if there is an error creating the PasswordReset or sending the email
  */
  resetPassword: Promise.method(function() {
    var self = this;

    return PasswordReset.createReset(this.get('id'))
    .then(function(passwordCode) {
      var link = rootUrl + '/users/reset/' + passwordCode;
      return verificationMailer.sendRecoverPasswordEmail({
        email: self.get('email'),
        resetLink : link,
        firstName: self.get('firstName')
      })
    });
  }),

  /*
    @method addUserToMailingList
    Add the user to the mailchimp mailing list

    @param {string} groupCategory - The category to put the user in the mailing list
                                    Can be 'mailingList' or 'registeredUser'

    @returns a Promise that 
    RESOLVES if sending the email is successful
    REJECTS if there is an error creating the PasswordReset or sending the email
  */
  addUserToMailingList: Promise.method(function(groupCategory) {
    return Mailchimp.addUserToList(this.get('email'), groupCategory, this.get('firstName'), this.get('lastName'));
  }),

  /*
    @method removeUserFromMailingList
    Remove the user from the mailchimp mailing list

    @returns a Promise that 
    RESOLVES if removing the user is successful
    REJECTS if there is an error removing the user
  */
  removeUserFromMailingList: Promise.method(function() {
    return Mailchimp.removeUserFromList(this.get('email'));
  }),

  /*
    @method sendVerificationEmail
    Send a verification email after registration. This contains a code that the user must use to verify their email

    @returns a Promise that 
    RESOLVES if sending the email is successful
    REJECTS if there is an error hashing the verification key or sending the email
  */
  sendVerificationEmail: Promise.method(function() {
    var self = this;
    return User.hashVerificationKey(this.get('email'))
    .then(function(verificationHash) {
      var params = {
        email: self.get('email'),
        firstName: self.get('firstName'),
        verificationLink: rootUrl + '/api/verify/'+self.get('id')+'?verification='+verificationHash
      };
      return verificationMailer.sendVerificationEmail(params);
    });
  }),

  /*
    @method checkVerification
    Check the provided hashed verification key against the secret verification key

    @param {string} hashParam - a bcrypt encrypted key that is sent from the user link to check against the internal data

    @returns a Promise that 
    RESOLVES with a successful save of the user with the updated verified status
    REJECTS if there is an error creating the hash to check against, comparing the two hashes, or saving the user
  */
  checkVerification: Promise.method(function(hashParam) {
    var self = this;
    return User.hashVerificationKey(this.get('email'))
    .then(function(verificationHash) {
      return bcrypt.compareAsync(verificationHash, hashParam)
      .then(function(hashMatch) {
        if(hashMatch) {
          return self.save({active: UserConstants.USER_VERIFIED});  
        } else {
          throw new Error('Verification hash does not match');
        }
      });
    });
  })

    // Private methods
    
}, {
  /* ------------------------------------
              User methods
  ------------------------------------ */

  /*
    @method hashPassword
    Takes a plain text password and returns a hashed version of it

    @param {string} password - the unhashed password

    @returns a Promise that 
    RESOLVES with the hashed password if successful
    REJECTS if there is an error hashing the password
  */
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

  /*
    @method hashVerificationKey
    Takes a plain text password and returns a hashed version of it

    @param {string} password - the unhashed password

    @returns a Promise that 
    RESOLVES with the hashed password if successful
    REJECTS if there is an error hashing the password
  */
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

  /*
    @method login
    Login the user with the provided email and password, verifying that the user exists, is verified, and has the correct password

    @param {string} email - the provided email to locate the user
    @param {string} password - the provided password for authentication

    @returns a Promise that 
    RESOLVES with the user if authentication is successful
    REJECTS if there is an error finding the user, the user is not verified, or the user password does not match
  */
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

  /*
    @method register
    Register the user with the provided attributes

    @param {object} attrs - the provided attributes for the user

    @returns a Promise that 
    RESOLVES with the user if registration is successful
    REJECTS if there is an invalid password, or there is an error hashing the password, or there is already a user with that email
  */
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
          user.sendVerificationEmail();
          return user;
        });
      });
      
    })
    .catch(Checkit.Error, function(err) {
      if(err.get('email')) {
        // Checkit email error
        throw new Error(err.get('email').message);
      } else {
        // Database error
        console.log(err);
        throw new Error('Error registering new profile');
      }
    });
  }),

  /*
    @method registerForMailingList
    Register the user as a user, specifically for the mailing list
    This means that we do not set a password or other attributes, but simply record there email, mark them as on the mailing list, and register them

    @param {string} email - the provided email for the user

    @returns a Promise that 
    RESOLVES with the user if registration is successful
    REJECTS if there is an error registering the user
  */
  registerForMailingList: Promise.method(function(email) {
    var attrs = {
      email: email,
      mailingList: true
    };
    console.log(attrs);
    return User.forge(attrs).save();
  }),

  // private
    /*
      @method permittedParams
      @private
      Filters the params into allowed values

      @param {object} attrs - the given attributes for the user

      @returns the attributes, filtered to allowable values
    */
    _permittedParams: function(attrs) {
      return _.pick(attrs, 'firstName', 'lastName', 'email', 'password', 'mailingList');
    },

    /*
      @method validatePassword
      @private
      Validates the password

      @param {string} password - the password to validate

      @returns true if valid, false otherwise
    */
    _validatePassword: function(password) {
      if(password && password.length < 8) return false;
      return true;
    },
});


module.exports = bookshelf.model('User', User);