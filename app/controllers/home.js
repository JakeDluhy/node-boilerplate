var passport = require('passport');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var env = require('../../config/environments/' + process.env.NODE_ENV);
var ContactMailer = require('../mailers/contact-mailer');
var contactEmail = env.nodemailer.username;
var User = require('../models/user');

module.exports = {
  index: function(req, res) {
    var context = (req.session.context === undefined ? {} : req.session.context);
    res.render('layouts/index', context);
    req.session.context = undefined;
  },
  login: function(req, res) {
    if(!req.user) {
      return res.json({error: 'There was a problem logging in to your account'});
    }
    if(req.user.errorType !== undefined) {
      res.json(req.user);
    } else {
      var token = jwt.sign(req.user, env.jwtSecret);
      res.json({token: token});
    }
  },
  register: function(req, res) {
    if(!req.body || !req.body.user) {
      console.log('User not sent with the registration request');
      return res.json({error: 'Error registering an account'});
    }

    User.register(this._permittedRegisterParams(req.body.user))
    .then(function(user) {
      res.json({success: "Congrats, you're in! Just verify your email and you're good to go!"});
    })
    .catch(function(err) {
      res.json({error: err});
    })
  },
  registerForMailingList: function(req, res) {
    if(!req.body || !req.body.email) {
      console.log('Email not sent when registering for mailing list');
      return res.json({error: 'Error signing up for the mailing list'});
    }

    User.registerForMailingList(req.body.email)
    .then(function(data) {
      res.json({success: "Congratulations! You're all signed up!"});
    })
    .catch(function(err) {
      console.log(err);
      res.json({error: "Unable to sign up for mailing list. Please contact support"});
    })
  },
  sendContactForm: function(req, res) {
    if(!req.body || !req.body.contact) {
      console.log('Contact information not provided with contact request');
      return res.json({error: 'Error contacting us, please directly email ' + contactEmail});
    }

    var reqContact = req.body.contact;
    ContactMailer.sendContactForm({name: reqContact.name, subject: reqContact.contactType, fromEmail: reqContact.email, content: reqContact.content})
    .then(function() {
      res.json({success: "Got it - We'll get back to you soon!"});
    })
    .catch(function(err) {
      console.log(err);
      res.json({error: err[0]});
    })
  },

  // PRIVATE
    _permittedRegisterParams: function(attrs) {
      return _.pick(attrs, 'firstName', 'lastName', 'email', 'password', 'mailingList');
    },
};