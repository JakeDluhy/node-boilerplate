var passport = require('passport');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var env = require('../../config/environments/' + process.env.NODE_ENV);
var contactMailer = require('../mailers/contact-mailer');

var User = require('../models/user');

module.exports = {
  update: function(req, res) {
    var self = this;
    if(!req['body'] || !req['body']['user']) {
      console.log('User not sent with the update request');
      return res.json({error: 'Error saving profile changes'});
    }

    User.forge({id: req.body.user.id}).fetch({require: true}).tap(function(user) {
      user.save(self._permittedUpdateParams(req.body.user), {patch: true}).then(function(user) {
        var token = jwt.sign(user, env.jwtSecret);
        return res.json({token: token});
      })
      .catch(function(err) {
        console.log(err);
        return res.json({error: 'Error saving profile changes'});
      });
    })
    .catch(function(err) {
      console.log(err);
      return res.json({error: 'Error saving profile changes'});
    });
  },
  changePassword: function(req, res) {
    if(!req.body || !req.body.user) {
      console.log('User not sent with the change password request');
      return res.json({error: 'Error changing password'});
    }

    User.forge({id: req.body.user.id}).fetch({require: true}).tap(function(user) {
      user.verifyPassword(req.body.user.oldPassword).then(function() {
        user.setPassword(req.body.user.newPassword).then(function(user) {
          var token = jwt.sign(user, env.jwtSecret);
          res.json({token: token});
        })
      })
      .catch(function(err) {
        console.log(err);
        res.json({error: 'Incorrect password'});
      });
    })
    .catch(function(err) {
      console.log(err);
      res.json({error: 'Error changing password'});
    })
  },
  verifyUser: function(req, res) {
    // Include a query param in the redirect so that frontend knows what message to show?
    User.forge({id: req.params.id}).fetch({require: true}).tap(function(user) {
      user.checkVerification(req.query.verification)
      .then(function() {
        var token = jwt.sign(user, env.jwtSecret);
        req.session.context = {
          jwtToken: token,
          success: "Thanks for joining! We're glad to have you"
        };
        res.redirect('/');
      })
      .catch(function(err) {
        console.log(err);
        req.session.context = {
          error: "There was an error verifying your account. Please reach out to us with your situation!"
        };
        res.redirect('/');
      });
    })
    .catch(function(err) {
      console.log(err);
      req.session.context = {
        error: "There was an error verifying your account. Please reach out to us with your situation!"
      };
      res.redirect('/');
    });
  },
  recoverPassword: function(req, res) {
    if(!req.body || !req.body.email) {
      console.log('User not sent with the recover password request');
      return res.json({error: 'Error recovering password'});
    }

    User.forge({email: req.body.email}).fetch({require: true}).then(function(user) {
      user.resetPassword()
      .then(function() {
        res.json({success: 'Please check your email, a new password should be arriving shortly'});
      })
    })
    .catch(User.NotFoundError, function(err) {
      console.log(err);
      res.json({error: "Couldn't find an account associated with this email"});
    })
    .catch(function(err) {
      console.log(err);
      res.json({error: 'There was a problem resetting your password. Please contact support'});
    });
  },

  // PRIVATE
    _permittedUpdateParams: function(attrs) {
      return _.pick(attrs, 'firstName', 'lastName', 'email', 'mailingList');
    },
};