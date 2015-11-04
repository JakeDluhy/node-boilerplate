var PATH_TO_ROOT = '../../..';

var Promise = require('bluebird');

var sinon = require('sinon');

var factory = require('factory-girl').promisify(Promise);
require('factory-girl-bookshelf')();
require('../factories/user');

var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();
var request = require('supertest');
var jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');

var app = require(PATH_TO_ROOT+'/config/setup-app');
var env = require(PATH_TO_ROOT+'/config/environments/' + process.env.NODE_ENV);
var UsersController = require(PATH_TO_ROOT+'/app/controllers/users');
var User = require(PATH_TO_ROOT+'/app/models/user');


// var UsersControllerStub = {};
// var UsersController = proxyquire('../../app/controllers/users', { 'path': UsersControllerStub});
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
    json: cb
  }
}

function factoryCleanup(done) {
  factory.cleanup()
  .then(function() {
    done();
  });
}

describe('Users Controller', function() {
  describe('Users UPDATE', function() {
    it('should call the users#update on a request', function(done) {
      var jwt = createJwtToken();
      request(app)
      .put('/api/users/1')
      .set('Authorization', 'Bearer ' + jwt)
      .end(function(err, res) {
        expect(res.body.error).to.equal('Error saving profile changes');
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
        expect(data.error).to.equal('Error saving profile changes');
        done();
      });

      UsersController.update(req, res);
    });

    it('should respond with an error when a non existent user is provided', function(done) {
      var req = {
        body: {
          user: {
            id: 123212343,
            firstName: 'Foo',
            lastName: 'Bar'
          }
        }
      };
      var res = getResponseObject(function(data) {
        expect(data.error).to.equal('Error saving profile changes');
        done();
      });

      UsersController.update(req, res);
    });

    it('should update user attributes', function(done) {
      factory.create('user')
      .then(function(user) {
        var num = Math.random()*100001|0;
        var req = {
          body:{ user: {
            id: user.get('id'),
            firstName: 'The New Guy'+num,
            lastName: 'The III'+num,
            email: 'thenewguy'+num+'@test.com'
          }}
        };
        var res = getResponseObject(function(data) {
          var responseUser = jwtDecode(data.token);
          expect(responseUser.firstName).to.equal(req.body.user.firstName);
          expect(responseUser.lastName).to.equal(req.body.user.lastName);
          expect(responseUser.email).to.equal(req.body.user.email);
          expect(data.token).to.not.be.undefined;
          
          factoryCleanup(done);
        });

        UsersController.update(req, res);
      });
    });

    it('should not update user password', function(done) {
      factory.create('user')
      .then(function(user) {
        var req = {
          body:{ user: {
            id: user.get('id'),
            password: 'foobarchoo2'
          }}
        };
        var res = getResponseObject(function(data) {
          var responseUser = jwtDecode(data.token);
          expect(responseUser.password).to.not.equal(req.body.user.password);
          expect(responseUser.password).to.equal('foobarchoo');
          expect(data.token).to.not.be.undefined;
          
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
        expect(res.body.error).to.equal('Error changing password');
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
        expect(data.error).to.equal('Error changing password');
        done();
      });

      UsersController.changePassword(req, res);
    });

    it('should respond with an error when a non existent user is provided', function(done) {
      var req = {
        body: {
          user: {
            id: 123212343,
            firstName: 'Foo',
            lastName: 'Bar'
          }
        }
      };
      var res = getResponseObject(function(data) {
        expect(data.error).to.equal('Error changing password');
        done();
      });

      UsersController.changePassword(req, res);
    });

    it('should update the user password', function(done) {
      var res = getResponseObject(function(data) {
        expect(data.token).to.not.be.undefined;
        
        factoryCleanup(done);
      });

      factory.withOptions({hashPass: true}).create('user')
      .then(function(user) {
        var req = {
          body:{ user: {
            id: user.get('id'),
            oldPassword: 'foobarchoo',
            newPassword: 'foobarchoo2'
          }}
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
          params: { id: 23453453 },
          session: {}
        };
        var res = {
          redirect: function(redirectPath) {
            expect(req.session.context.error).to.equal("There was an error verifying your account. Please reach out to us with your situation!");

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
            expect(req.session.context.error).to.equal("There was an error verifying your account. Please reach out to us with your situation!");

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
            expect(req.session.context.jwtToken).to.not.be.undefined;
            expect(req.session.context.success).to.equal("Thanks for joining! We're glad to have you");
            
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
        expect(res.body.error).to.equal('Error recovering password');
        done();
      });
    });

    it('should respond with an error when no user is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.error).to.equal('Error recovering password');
        done();
      });

      UsersController.recoverPassword(req, res);
    });

    it('should respond with an error when a bad email is provided', function(done) {
      var req = {
        body: { email: 'foo.bar.bademail123124131@gmail.com' }
      };
      var res = getResponseObject(function(data) {
        expect(data.error).to.equal("Couldn't find an account associated with this email");
        done();
      });

      UsersController.recoverPassword(req, res);
    });

    it('should respond with a success message on completion', function(done) {
      this.timeout(5000);

      factory.create('user')
      .then(function(user) {
        var req = {
          body: { email: user.get('email') }
        };
        var res = getResponseObject(function(data) {
          expect(data.success).to.equal('Please check your email, a new password should be arriving shortly');
          
          factoryCleanup(done);
        });

        UsersController.recoverPassword(req, res);
      });
    });
  });
});