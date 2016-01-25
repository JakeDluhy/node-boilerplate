/*
  IMPORT PACKAGES
*/
var passport = require('passport');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

/*
  ENVIRONMENT CONFIG
*/
var env = require('../../config/environments/' + process.env.NODE_ENV);
var contactEmail = env.nodemailer.username;
var jwtSecret = env.jwtSecret;
var redisPrefix = env.redisPrefix;

/*
  EXTERNAL MODULES
*/
var ContactMailer = require('../mailers/contact-mailer');
var Checkit = require('../../config/checkit');
var redis = require('../../config/redis');

/*
  MODELS
*/
var User = require('../models/user');

/*
  HOME CONTROLLER
*/
module.exports = {
  /*
    @action GET index
    Responds to generic routes by serving the html

    @if req.session.context is defined, it passes the context to the handlebars renderer
        this allows the app to send data with the index template
  */
  index: function(req, res) {
    var redisKey = '';
    // Allow passage of a specific version
    if(req.query.revision) {
      redisKey = redisPrefix+req.query.revision;
    // If development, use the default
    } else if(process.env.NODE_ENV === 'development') {
      redisKey = redisPrefix+'default';
    // In production, use the active version
    } else {
      redisKey = redisPrefix+'current-content';
    }
    redis.get(redisKey)
    .then(function(rawString) {
      console.log(rawString);
      console.log(privateMethods.processIndex(rawString));
      res.send(privateMethods.processIndex(rawString));
    })
    .catch(function(err) {
      res.send('error');
    });
  },

  /*
    @action POST login
    The endpoint that is hit after the passport middleware

    @param {object} req - will contain the key user
                          user will either be the user object, or an error hash of the form
                          {
                            errors: {type: {string}, error: {string}}
                          }

    @responds with {
                      meta: {token: {token}, user: {object}}
                    }
  */
  login: function(req, res) {
    if(!req.user) {
      return res.status(401).json({ errors: {error: 'There was a problem logging in to your account'} });
    }
    if(req.user.errorType !== undefined) {
      res.status(401).json({ errors: req.user });
    } else {
      var token = jwt.sign(req.user, jwtSecret);
      res.json({ meta: {token: token, user: _.omit(req.user, 'password')} });
    }
  },

  /*
    @action POST register
    Register a new user

    @param {object} req - will contain the user resource to create in the body
    {
      data: {
        type: 'user',
        attributes: {
          {attributes}
        }
      }
    }

    @responds with {
                      meta: {success: {string}}
                    }
  */
  register: function(req, res) {
    if(!req.body || !req.body.data || !req.body.data.attributes) {
      console.log('User not sent with the registration request');
      return res.status(401).json({ errors: {error: 'Error registering an account'} });
    }

    User.register(privateMethods._permittedRegisterParams(req.body.data.attributes))
    .then(function(user) {
      res.status(201).json({ meta: {success: "Congrats, you're in! Once you verify your email you'll be good to go!"} });
    })
    .catch(function(err) {
      console.log(err.message);
      res.status(401).json({ errors: {error: err.message} });
    })
  },

  /*
    @action POST registerForMailingList
    Register an email for the mailing list

    @param {object} req - will contain the user resource with only an email
    {
      data: {
        type: 'user',
        attributes: {
          email: {string}
        }
      }
    }

    @responds with {
                      meta: {success: {string}}
                    }
  */
  registerForMailingList: function(req, res) {
    if(!req.body || !req.body.data || !req.body.data.attributes || !req.body.data.attributes.email) {
      console.log('Email not sent when registering for mailing list');
      return res.status(401).json({ errors: {error: 'Error signing up for the mailing list'} });
    }

    User.registerForMailingList(req.body.data.attributes.email)
    .then(function(data) {
      res.status(201).json({ meta: {success: "Congratulations! You're all signed up!"} });
    })
    .catch(Checkit.Error, function(err) {
      res.status(401).json({ errors: {error: "That email has already been registered"} });
    })
    .catch(function(err) {
      res.status(401).json({ errors: {error: "Unable to sign up for mailing list. Please contact support"} });
    })
  },

  /*
    @action POST sendContactForm
    Send the contact form to the environment contact email

    @param {object} req - will contain the contact resource to create in the body
    {
      data: {
        type: 'contact',
        attributes: {
          name: {string},
          contactType: {string},
          email: {string},
          content: {string}
        }
      }
    }

    @responds with {
                      meta: {success: {string}}
                    }
  */
  sendContactForm: function(req, res) {
    if(!req.body || !req.body.data || !req.body.data.attributes) {
      console.log('Contact information not provided with contact request');
      return res.status(400).json({ errors: {error: 'Error contacting us, please directly email ' + contactEmail} });
    }

    var reqContact = req.body.data.attributes;
    ContactMailer.sendContactForm({name: reqContact.name, subject: reqContact.contactType, fromEmail: reqContact.fromEmail, content: reqContact.content})
    .then(function() {
      res.status(200).json({ meta: {success: "Got it - We'll get back to you soon!"} });
    })
    .catch(function(err) {
      console.log(err);
      res.status(400).json({ errors: {error: err[0]} });
    });
  },
};

// PRIVATE
var privateMethods = {
  /*
    @object _permittedRegisterParams
    @private

    @params {object} attrs - the request attributes
    @returns {object} the filtered attributes
  */
  _permittedRegisterParams: function(attrs) {
    return _.pick(attrs, 'firstName', 'lastName', 'email', 'password', 'mailingList');
  },

  processIndex: function(rawString) {
    if(process.env.NODE_ENV === 'development') {
      return rawString.replace(/assets/g, 'http://localhost:4200/assets');
    }
  }
}