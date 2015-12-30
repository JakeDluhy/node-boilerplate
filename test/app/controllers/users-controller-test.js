var PATH_TO_ROOT = '../../..';

/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');
var sinon = require('sinon');
var factory = require('factory-girl').promisify(Promise);
require('factory-girl-bookshelf')();
var request = require('supertest');
var jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');

/*
  IMPORT TEST HELPERS
*/
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();

/*
  ENVIRONMENT CONFIG
*/
var env = require(PATH_TO_ROOT+'/config/environments/' + process.env.NODE_ENV);

/*
  EXTERNAL MODULES
*/
var app = require(PATH_TO_ROOT+'/config/setup-app');
require('../factories/user');
var mailer = require(PATH_TO_ROOT+'/config/nodemailer');

/*
  MODELS
*/
var User = require(PATH_TO_ROOT+'/app/models/user');
var PasswordReset = require(PATH_TO_ROOT+'/app/models/password-reset');

/*
  CONTROLLERS
*/
var UsersController = require(PATH_TO_ROOT+'/app/controllers/users');



function createJwtToken() {
  var user = {
    firstName: 'Jake',
    lastName: 'Dluhy',
    email: 'dluhy.jake@gmail.com',
    password: 'mypassword'
  };
  return jwt.sign(user, env.jwtSecret);
}

function getResponseObject(cb) {
  return {
    status: function() { return this; },
    json: cb
  }
}

function factoryCleanup(done) {
  factory.cleanup()
  .then(function() {
    done();
  });
}

/*
  USERS CONTROLLER TEST
*/
describe('Users Controller', function() {
  describe('Users UPDATE', function() {
    it('should call the users#update on a request', function(done) {
      var jwt = createJwtToken();
      request(app)
      .put('/api/users/1')
      .set('Authorization', 'Bearer ' + jwt)
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error saving profile changes');
        done();
      });
    });

    it('should respond with 401 if unauthorized', function(done) {
      request(app)
      .put('/api/users/1')
      .end(function(err, res) {
        expect(res.error.status).to.equal(401);
        done();
      });
    });

    it('should respond with an error when no user is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error saving profile changes');
        done();
      });

      UsersController.update(req, res);
    });

    it('should respond with an error when a non existent user is provided', function(done) {
      var req = {
        body: {
          data: {
            type: 'user',
            id: 12312,
            attributes: {
              firstName: 'Foo',
              lastName: 'Bar'
            }
          }
        },
        user: { id: 12312 },
        params: { id: 12312 }
      };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error saving profile changes');
        done();
      });

      UsersController.update(req, res);
    });

    it('should update user attributes', function(done) {
      factory.create('user')
      .then(function(user) {
        var num = Math.random()*100001|0;
        var req = {
          body: { data: {
            type: 'user',
            id: user.get('id'),
            attributes: {
              firstName: 'The New Guy'+num,
              lastName: 'The III'+num,
              email: 'thenewguy'+num+'@test.com'
            }
          } },
          user: { id: user.get('id') },
          params: { id: user.get('id') }
        };
        var res = getResponseObject(function(data) {
          var responseUser = jwtDecode(data.meta.token);
          expect(responseUser.firstName).to.equal(req.body.data.attributes.firstName);
          expect(responseUser.lastName).to.equal(req.body.data.attributes.lastName);
          expect(responseUser.email).to.equal(req.body.data.attributes.email);
          expect(data.meta.token).to.not.be.undefined;
          
          factoryCleanup(done);
        });

        UsersController.update(req, res);
      });
    });

    it('should respond with an error if the user to update is not the current user', function(done) {
      var req = {
        body: { data: {
          type: 'user',
          id: 123212343,
          attributes: {
            firstName: 'Foo',
            lastName: 'Bar',
            email: 'myemail@test.com'
          }
        } },
        user: { id: 123123 },
        params: { id: 123212343 }
      };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Not authorized to edit that account');
        done();
      });

      UsersController.update(req, res);
    });

    it('should not update user password', function(done) {
      factory.create('user')
      .then(function(user) {
        var req = {
          body:{ data: {
            type: 'user',
            id: user.get('id'),
            attributes: { password: 'foobarchoo2' }
          } },
          user: { id: user.get('id') },
          params: { id: user.get('id') }
        };
        var res = getResponseObject(function(data) {
          var responseUser = jwtDecode(data.meta.token);
          expect(responseUser.password).to.not.equal(req.body.data.attributes.password);
          expect(responseUser.password).to.equal('foobarchoo');
          expect(data.meta.token).to.not.be.undefined;
          
          factoryCleanup(done);
        });

        UsersController.update(req, res);
      });
    });
  });

  describe('Users Change Password', function() {
    it('should call the users#changePassword on a request', function(done) {
      var jwt = createJwtToken();
      request(app)
      .put('/api/users/1/change_password')
      .set('Authorization', 'Bearer ' + jwt)
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error changing password');
        done();
      });
    });

    it('should respond with 401 if unauthorized', function(done) {
      request(app)
      .put('/api/users/1/changePassword')
      .end(function(err, res) {
        expect(res.error.status).to.equal(401);
        done();
      });
    });

    it('should respond with an error when no user is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error changing password');
        done();
      });

      UsersController.changePassword(req, res);
    });

    it('should respond with an error when the current user trys to change someone elses password', function(done) {
      var req = {
        body: { data: {
          type: 'user',
          id: 123212343,
          attributes: {
            firstName: 'Foo',
            lastName: 'Bar'
          }
        } },
        user: { id: 121312 }
      };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Only a user can update their own password');
        done();
      });

      UsersController.changePassword(req, res);
    });

    it('should respond with an error when a non existent user is provided', function(done) {
      var req = {
        body: {
          data: {
            type: 'user',
            id: 123212343,
            attributes: {
              firstName: 'Foo',
              lastName: 'Bar'
            }
          }
        },
        user: { id: 123212343 }
      };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error changing password');
        done();
      });

      UsersController.changePassword(req, res);
    });

    it('should update the user password', function(done) {
      var res = getResponseObject(function(data) {
        expect(data.meta.token).to.not.be.undefined;
        
        factoryCleanup(done);
      });

      factory.withOptions({hashPass: true}).create('user')
      .then(function(user) {
        var req = {
          body: { data: {
            type: 'user',
            id: user.get('id'),
            attributes: {
              oldPassword: 'foobarchoo',
              newPassword: 'foobarchoo2'  
            }
          } },
          user: { id: user.get('id') }
        };

        UsersController.changePassword(req, res);
      });
    });
  });

  describe('Users Verify', function() {
    it('should call the users#verifyUser on a request', function(done) {
      request(app)
      .get('/api/verify/1')
      .end(function(err, res) {
        expect(res.statusCode).to.equal(302);
        done();
      });
    });

    it('should respond with an error when a bad ID is provided', function(done) {
      factory.create('user')
      .then(function(user) {
        var req = {
          params: { id: user.get('id')+1 },
          session: {}
        };
        var res = {
          redirect: function(redirectPath) {
            expect(req.session.context.errors.error).to.equal("There was an error verifying your account. Please reach out to us with your situation!");

            factoryCleanup(done);
          }
        };

        UsersController.verifyUser(req, res);
      });
    });

    it('should respond with an error when a bad verification code is provided', function(done) {
      factory.create('user')
      .then(function(user) {
        var req = {
          params: { id: user.get('id') },
          query: { verification: 'asdfasdfa' },
          session: {}
        };
        var res = {
          redirect: function(redirectPath) {
            expect(req.session.context.errors.error).to.equal("There was an error verifying your account. Please reach out to us with your situation!");

            factoryCleanup(done);
          }
        };

        UsersController.verifyUser(req, res);
      });
    });

    it('should respond with data when the correct verification is provided', function(done) {
      var stub = sinon.stub(User.prototype, 'checkVerification').resolves();
      factory.create('user')
      .then(function(user) {
        var req = {
          params: { id: user.get('id') },
          query: { verification: 'asdfasdfa' },
          session: {}
        };
        var res = {
          redirect: function(redirectPath) {
            expect(req.session.context.meta.jwtToken).to.not.be.undefined;
            expect(req.session.context.meta.success).to.equal("Thanks for joining! We're glad to have you");
            
            stub.restore();
            factoryCleanup(done);
          }
        };

        UsersController.verifyUser(req, res);
      });
    });
  });

  describe('Users Recover Password', function() {
    it('should call the users#recoverPassword on a request', function(done) {
      request(app)
      .post('/api/recover_password')
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error recovering password');
        done();
      });
    });

    it('should respond with an error when no user is provided', function(done) {
      var req = { body: {} };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error recovering password');
        done();
      });

      UsersController.recoverPassword(req, res);
    });

    it('should respond with an error when a bad email is provided', function(done) {
      var req = {
        body: { data: { 
          id: 123123123,
          type: 'user',
          attributes: {          
            email: 'foo.bar.bademail123124131@gmail.com'
          }
        } }
      };
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal("Couldn't find an account associated with this email");
        done();
      });

      UsersController.recoverPassword(req, res);
    });

    it('should respond with a success message on completion', function(done) {
      var stub = sinon.stub(mailer, 'sendMailAsync').resolves();
      this.timeout(5000);

      factory.create('user')
      .then(function(user) {
        var req = {
          body: { data: { 
            id: 123123123,
            type: 'user',
            attributes: {          
              email: user.get('email')
            }
          } }
        };
        var res = getResponseObject(function(data) {
          expect(data.meta.success).to.equal('Please check your email for further instructions');
          
          stub.restore();
          PasswordReset.forge({userId: user.get('id')}).fetch().then(function(passReset) {
            return passReset.destroy();
          })
          .then(function() {
            factoryCleanup(done);
          });
        });

        UsersController.recoverPassword(req, res);
      });
    });
  });
});