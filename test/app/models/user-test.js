var PATH_TO_ROOT = '../../..';

/*
  IMPORT PACKAGES
*/
var PATH_TO_ROOT = '../../..';
var Promise = require('bluebird');
var sinon = require('sinon');
require('sinon-as-promised')(Promise);
var factory = require('factory-girl').promisify(Promise);
require('factory-girl-bookshelf')();
var bcrypt = Promise.promisifyAll(require('bcrypt'));

/*
  IMPORT TEST HELPERS
*/
var assert = require('chai').assert;
var expect = require('chai').expect;

/*
  ENVIRONMENT CONFIG
*/
var rootUrl = require(PATH_TO_ROOT+'/config/environments/'+process.env.NODE_ENV).rootUrl;

/*
  EXTERNAL MODULES
*/
var UserConstants = require(PATH_TO_ROOT+'/app/constants/user');
var VerificationMailer = require(PATH_TO_ROOT+'/app/mailers/verification-mailer');
require('../factories/user');

/*
  MODELS
*/
var User = require(PATH_TO_ROOT+'/app/models/user');


function factoryCleanup(done) {
  factory.cleanup()
  .then(function() {
    done();
  });
}

describe('User Model', function() {
  describe('user setPassword', function() {
    it('should throw an error if the password is invalid', function(done) {
      var stub = sinon.stub(User, '_validatePassword').returns(false);
      factory.build('user')
      .then(function(user) {
        user.setPassword('sdf')
        .catch(function(err) {
          expect(err.message).to.equal('Invalid Password');
          stub.restore();
          done();
        });
      });
    });

    it('should update the users password with a hashed version of the new one', function(done) {
      var stub = sinon.stub(User, '_validatePassword').returns(true);
      factory.build('user', function(err, user) {
        user.setPassword('foobarchoo2')
        .then(function(user2) {
          expect(user2.get('password')).to.be.a('string');
          expect(user2.get('password')).to.not.equal('foobarchoo2');

          stub.restore();
          done();
        });
      });
    });
  });

  describe('user resetPassword', function() {
    it('should set a temporary password', function(done) {
      factory.build('user')
      .then(function(user) {
        var mock = sinon.mock(user).expects('setPassword').once().resolves();
        var stub = sinon.stub(VerificationMailer, 'sendRecoverPasswordEmail').resolves();
        
        user.resetPassword()
        .then(function() {
          stub.restore();
          user.setPassword.restore();
          done();
        });
      });
    });

    it('should send an email with the password details', function(done) {
      factory.build('user')
      .then(function(user) {
        var stub = sinon.stub(user, 'setPassword').resolves();
        var mock = sinon.mock(VerificationMailer).expects('sendRecoverPasswordEmail').once().resolves();
        
        user.resetPassword()
        .then(function() {
          stub.restore();
          VerificationMailer.sendRecoverPasswordEmail.restore();
          done();
        });
      });
    });
  });

  describe('user sendVerificationEmail', function() {
    it('should send an email with the verification link', function(done) {
      var stub = sinon.stub(User, 'hashVerificationKey').resolves('verificationHash');
      factory.create('user')
      .then(function(user) {
        var mock = sinon.mock(VerificationMailer).expects('sendVerificationEmail').withExactArgs({
          email: user.get('email'),
          firstName: user.get('firstName'),
          verificationLink: rootUrl + '/api/verify/' +user.get('id')+ '?verification=verificationHash'
        }).resolves();

        user.sendVerificationEmail()
        .then(function() {
          stub.restore();
          VerificationMailer.sendVerificationEmail.restore();
          factoryCleanup(done);
        });
      });
    });
  });

  describe('user checkVerification', function() {
    it('should set the user active attribute to verified on completion', function(done) {
      var stub = sinon.stub(User, 'hashVerificationKey').resolves();
      var stub2 = sinon.stub(bcrypt, 'compareAsync').resolves(true);
      factory.build('user')
      .then(function(user) {
        expect(user.get('active')).to.not.equal(UserConstants.USER_VERIFIED);
        user.checkVerification()
        .then(function(user2) {
          expect(user2.get('active')).to.equal(UserConstants.USER_VERIFIED);

          stub.restore();
          stub2.restore();
          done();
        })
      })
    });
  });

  describe('User login', function() {
    it('should respond with an error if email or password isnt provided', function(done) {
      User.login('', 'mypass')
      .catch(function(err) {
        expect(err.message).to.equal('Email and password are both required');

        User.login('email@test.com', '')
        .catch(function(err) {
          expect(err.message).to.equal('Email and password are both required');

          User.login('', '')
          .catch(function(err) {
            expect(err.message).to.equal('Email and password are both required');

            done();
          });
        });
      });
    });

    it('should respond with an error if the user is unverified', function(done) {
      factory.create('user')
      .then(function(user) {
        User.login(user.get('email'), user.get('password'))
        .catch(function(err) {
          expect(err.message).to.equal('notVerified');

          factoryCleanup(done);
        });
      });
    });

    it('should respond with an error if the password is wrong', function(done) {
      factory.create('user', {active: 1})
      .then(function(user) {
        User.login(user.get('email'), 'sdfasdfasdf')
        .catch(function(err) {
          expect(err.message).to.equal('invalidPassword');

          factoryCleanup(done);
        });
      });
    });

    it('should return the user on success', function(done) {
      factory.withOptions({hashPass: true}).create('user', {active: 1})
      .then(function(user) {
        User.login(user.get('email'), 'foobarchoo')
        .then(function(user2) {
          expect(user2.get('firstName')).to.equal(user.get('firstName'));
          expect(user2.get('lastName')).to.equal(user.get('lastName'));
          expect(user2.get('email')).to.equal(user.get('email'));

          factoryCleanup(done);
        });
      });
    });
  });

  describe('User register', function() {
    it('should throw an error if email or password isnt provided', function(done) {
      var attrs = {
        firstName: 'Foo',
        lastName: 'Bar',
        email: '',
        password: ''
      };

      User.register(attrs)
      .catch(function(err) {
        expect(err.message).to.equal('Email and Password required');

        attrs.email = 'foo.bar@test.com';
        User.register(attrs)
        .catch(function(err) {
          expect(err.message).to.equal('Email and Password required');

          attrs.password = 'foobarpass';
          attrs.email = '';
          User.register(attrs)
          .catch(function(err) {
            expect(err.message).to.equal('Email and Password required');

            done();
          });
        });
      });
    });

    it('should throw an error if the password isnt valid', function(done) {
      var stub = sinon.stub(User, '_validatePassword').returns(false);
      var attrs = {firstName: 'Foo', lastName: 'Bar', email: 'foo.bar@gmail.com', password:'foobar'};

      User.register(attrs)
      .catch(function(err) {
        expect(err.message).to.equal('Invalid password');

        stub.restore();
        done();
      });
    });

    it('should throw an error if the email already exists', function(done) {
      var stub = sinon.stub(User, 'hashPassword').resolves('foobarchoo2');
      factory.create('user')
      .then(function(user) {
        var attrs = {firstName: 'Foo', lastName: 'Bar', email: user.get('email'), password:'foobarchoo2'};

        User.register(attrs)
        .catch(function(err) {
          expect(err.message).to.equal('email must be unique. ' +user.get('email')+ ' already exists.');

          User.hashPassword.restore();
          factoryCleanup(done);
        });
      });
    });

    it('should create a user with the provided params if the email doesnt exist', function(done) {
      var stub = sinon.stub(User, 'hashPassword').resolves('foobarchoo2');
      factory.create('user')
      .then(function(user) {
        var num = Math.random()*1000001|0;
        var attrs = {firstName: 'Foo', lastName: 'Bar', email: 'foo.bar'+num+'@test.com', password:'foobarchoo2'};

        User.register(attrs)
        .then(function(user2) {
          expect(user2.get('created_at')).to.not.be.undefined;

          User.hashPassword.restore();
          factoryCleanup(done);
        });
      });
    });

    it('should update a user with the new information if the email already exists without a password', function(done) {
      var stub = sinon.stub(User, 'hashPassword').resolves('foobarchoo2');
      factory.create('mailingListUser')
      .then(function(user) {
        var attrs = {firstName: 'Foo', lastName: 'Bar', email: user.get('email'), password:'foobarchoo2'};

        User.register(attrs)
        .then(function(user2) {
          expect(user2.get('firstName')).to.equal('Foo');
          expect(user2.get('lastName')).to.equal('Bar');
          expect(user2.get('createdAt')).to.not.be.undefined;

          User.hashPassword.restore();
          factoryCleanup(done);
        });
      });
    });

    it('should add the user to the mailing list if option selected', function(done) {
      var stub = sinon.stub(User, 'hashPassword').resolves('foobarchoo2');
      var mock = sinon.mock(User.prototype).expects('addUserToMailingList').withExactArgs('registeredUser').once();
      var num = Math.random()*1000001|0;
      var attrs = {firstName: 'Foo', lastName: 'Bar', email: 'foo.bar'+num+'@test.com', password:'foobarchoo2', mailingList: true};

      User.register(attrs)
      .then(function(user) {
        User.hashPassword.restore();
        User.prototype.addUserToMailingList.restore();
        factoryCleanup(done);
      });
    });

    it('should send a verification email', function(done) {
      var stub = sinon.stub(User, 'hashPassword').resolves('foobarchoo2');
      var mock = sinon.mock(User.prototype).expects('sendVerificationEmail').once();
      var num = Math.random()*1000001|0;
      var attrs = {firstName: 'Foo', lastName: 'Bar', email: 'foo.bar'+num+'@test.com', password:'foobarchoo2'};

      User.register(attrs)
      .then(function(user) {
        User.hashPassword.restore();
        User.prototype.sendVerificationEmail.restore();
        factoryCleanup(done);
      });
    });
  });

  describe('User registerForMailingList', function(done) {
    it('should create a user with just an email', function(done) {
      var num = Math.random()*1000001|0;
      var email = 'foo.bar'+num+'@test.com';

      User.registerForMailingList(email)
      .then(function(user) {
        expect(user.get('created_at')).to.not.be.undefined;
        expect(user.get('email')).to.equal(email);
        expect(user.get('password')).to.be.undefined;

        done();
      });
    });

    it('should add the user to the mailchimp mailing list', function(done) {
      var mock = sinon.mock(User.prototype).expects('addUserToMailingList').withExactArgs('mailingList').once();
      var num = Math.random()*1000001|0;
      var email = 'foo.bar'+num+'@test.com';

      User.registerForMailingList(email)
      .then(function(user) {
        User.prototype.addUserToMailingList.restore();
        done();
      });
    });
  });

  describe('User _permittedParams', function() {
    it('should filter the params', function() {
      var attrs = {
        name: 'Foo Bar',
        email: 'foo.bar@test.com'
      };

      var filtered = User._permittedParams(attrs);

      expect(filtered.email).to.equal('foo.bar@test.com');
      expect(filtered.name).to.be.undefined;
    });
  });
});