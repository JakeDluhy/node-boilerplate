var PATH_TO_ROOT = '../../..';

/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');
var sinon = require('sinon');
require('sinon-as-promised')(Promise);
var factory = require('factory-girl').promisify(Promise);
require('factory-girl-bookshelf')();
var request = require('supertest');
var jwt = require('jsonwebtoken');

/*
  IMPORT TEST HELPERS
*/
var assert = require('chai').assert;
var expect = require('chai').expect;

/*
  ENVIRONMENT CONFIG
*/
var env = require(PATH_TO_ROOT+'/config/environments/' + process.env.NODE_ENV);

/*
  EXTERNAL MODULES
*/
var app = require(PATH_TO_ROOT+'/config/setup-app');
require('../factories/user');
var ContactMailer = require(PATH_TO_ROOT+'/app/mailers/contact-mailer');

/*
  MODELS
*/
var User = require('../../../app/models/user');

/*
  CONTROLLERS
*/
var HomeController = require(PATH_TO_ROOT+'/app/controllers/home');



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

describe('Home Controller', function() {
  describe('Home Index', function() {
    it('should render the webpage at /', function(done) {
      request(app)
      .get('/')
      .end(function(err, res) {
        expect(res.statusCode).to.equal(200);
        done()
      });
    });

    it('should render the webpage at /*', function(done) {
      request(app)
      .get('/asdfasdf')
      .end(function(err, res) {
        expect(res.statusCode).to.equal(200);
        done()
      });
    });

    it('should render the webpage with context if it is provided', function(done) {
      var req = {session: {context: {
        error: 'An error'
      }}};
      var res = {render: function(template, context) {
        expect(template).to.equal('layouts/index');
        expect(context.error).to.equal('An error');
        done();
      }};

      HomeController.index(req, res);
    });

    // it('should set the session context to undefined after rendering', function() {
    //   var req = {session: {context: {
    //     error: 'An error';
    //   }}};
    //   var res = {render: function(route, context) {
    //     expect(context.error).to.equal('An error');
    //   }};


    // });
  });

  describe('Home Login', function() {
    it('should call home#login on a request', function(done) {
      request(app)
      .post('/api/login')
      .end(function(err, res) {
        expect(res.statusCode).to.equal(400);
        done();
      });
    });

    it('should respond with an error if the user cant be found', function(done) {
      request(app)
      .post('/api/login')
      .send({
        email: 'foo.bar.doesnotexist@gmail.com',
        password: 'mypassword'
      })
      .end(function(err, res) {
        expect(res.body.errors.errorType).to.equal('notFoundError');
        expect(res.body.errors.error).to.equal('No account exists with this email');
        done();
      });
    });

    it('should respond with an error if the password is invalid', function(done) {
      factory.create('user', {active: 1})
      .then(function(user) {
        request(app)
        .post('/api/login')
        .send({
          email: user.get('email'),
          password: 'wrongpassword'
        })
        .end(function(err, res) {
          expect(res.body.errors.errorType).to.equal('invalidPasswordError');
          expect(res.body.errors.error).to.equal('Invalid Password');

          factoryCleanup(done);
        });
      });
    });

    it('should respond with an error if the user is unverified', function(done) {
      factory.create('user')
      .then(function(user) {
        request(app)
        .post('/api/login')
        .send({
          email: user.get('email'),
          password: user.get('password')
        })
        .end(function(err, res) {
          expect(res.body.errors.errorType).to.equal('notVerifiedError');
          expect(res.body.errors.error).to.equal('Your account is not verified. Please check your email');

          factoryCleanup(done);
        });
      });
    });

    it('should respond with the jwt token on completion', function(done) {
      factory.withOptions({hashPass: true}).create('user', {active: 1})
      .then(function(user) {
        request(app)
        .post('/api/login')
        .send({
          email: user.get('email'),
          password: 'foobarchoo'
        })
        .end(function(err, res) {
          expect(res.body.meta.token).to.not.be.undefined;

          factoryCleanup(done);
        });
      });
    });
  });

  describe('Home Register', function() {
    it('should call home#register on a request', function(done) {
      request(app)
      .post('/api/register')
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error registering an account');
        done();
      });
    });

    it('should respond with an error if no user is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error registering an account');
        done();
      });

      HomeController.register(req, res);
    });

    it('should respond with a success message on completion', function(done) {
      var stub = sinon.stub(User, 'register').resolves({});
      var req = { body: { data: { attributes: { } } } };
      var res = getResponseObject(function(data) {
        console.log(data);
        expect(data.meta.success).to.equal("Congrats, you're in! Once you verify your email you'll be good to go!");
        User.register.restore();
        done();
      });

      HomeController.register(req, res);
    });
  });

  describe('Home Register for Mailing List', function() {
    it('should call home#registerForMailingList on a request', function(done) {
      request(app)
      .post('/api/mailing_list')
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error signing up for the mailing list');
        done();
      });
    });

    it('should respond with an error if no email is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error signing up for the mailing list');
        done();
      });

      HomeController.registerForMailingList(req, res);
    });

    it('should respond with a success message on completion', function(done) {
      var stub = sinon.stub(User, 'registerForMailingList').resolves({});
      var req = { body: { data: { attributes: { email: 'foo.bar@test.com' } } } };
      var res = getResponseObject(function(data) {
        console.log(data);
        expect(data.meta.success).to.equal("Congratulations! You're all signed up!");
        User.registerForMailingList.restore();
        done();
      });

      HomeController.registerForMailingList(req, res);
    });
  });

  describe('Home Send Contact Form', function() {
    it('should call home#sendContactForm on a request', function(done) {
      request(app)
      .post('/api/contact')
      .end(function(err, res) {
        expect(res.body.errors.error).to.equal('Error contacting us, please directly email '+env.nodemailer.username);
        done();
      });
    });

    it('should respond with an error if no contact information is provided', function(done) {
      var req = {};
      var res = getResponseObject(function(data) {
        expect(data.errors.error).to.equal('Error contacting us, please directly email '+ env.nodemailer.username);
        done();
      });

      HomeController.sendContactForm(req, res);
    });

    it('should send the contact form with the correct params', function(done) {
      var expectation = sinon.mock(ContactMailer).expects('sendContactForm').withExactArgs({
        name: 'foobar',
        subject: 'bug',
        fromEmail: 'foo.bar@test.com',
        content: 'I found a bug!'
      }).resolves();

      var req = { body: { data: {
        type: 'contact',
        attributes: {
          name: 'foobar',
          contactType: 'bug',
          fromEmail: 'foo.bar@test.com',
          content: 'I found a bug!'
        }
      } } };

      var res = getResponseObject(function(data) {
        ContactMailer.sendContactForm.restore();
        done();
      });
      
      HomeController.sendContactForm(req, res);
    });

    it('should respond with a success message on completion', function(done) {
      var stub = sinon.stub(ContactMailer, 'sendContactForm').resolves();
      var req = { body: { data: { attributes: {} } } };
      var res = getResponseObject(function(data) {
        expect(data.meta.success).to.equal("Got it - We'll get back to you soon!");
        ContactMailer.sendContactForm.restore();
        done();
      });

      HomeController.sendContactForm(req, res);
    });
  });
});