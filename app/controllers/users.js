/*
  IMPORT PACKAGES
*/
var passport = require('passport');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var moment = require('moment');

/*
  ENVIRONMENT CONFIG
*/
var env = require('../../config/environments/' + process.env.NODE_ENV);
var jwtSecret = env.jwtSecret;

/*
  EXTERNAL MODULES
*/
var contactMailer = require('../mailers/contact-mailer');

/*
  MODELS
*/
var User = require('../models/user');
var PasswordReset = require('../models/password-reset');

/*
  USERS CONTROLLER
*/
module.exports = {
  /*
    @action GET show
    Retrieve a single user record

    @param {number} body.params.id - the user ID

    @responds with {
                      data: {
                        type: 'user',
                        id: {number},
                        attributes: {object}
                      }
                    }
  */
  show: function(req, res) {
    if(!req.params || !req.params.id) {
      return res.status(400).json({ errors: {error: 'Error retrieving user data'} });
    }

    User.forge({id: req.params.id}).fetch({require: true}).tap(function(user) {
      res.status(200).json({
        data: {
          type: 'user',
          id: user.id,
          attributes: _.pick(user, 'firstName', 'lastName')
        }
      });
    })
    .catch(function(err) {
      res.status(404).json({ errors: {error: 'User not found'} });
    });
  },

  /*
    @action GET currentUser
    Retrieve the current user by stored jwtToken

    @param {object} req.user - When the request passes through expressJwt it assigns the decoded user to req.user

    @responds with {
                      data: {
                        type: 'user',
                        id: {number},
                        attributes: {object}
                      }
                    }
  */
  currentUser: function(req, res) {
    if(!req.user || !req.user.id) {
      return res.status(400).json({ errors: {error: 'Error retrieving the current user'} });
    }
    User.forge({id: req.user.id}).fetch({require: true}).tap(function(user) {
      return res.json({
        data: {
          type: 'user',
          id: user.id,
          attributes: _.omit(user.attributes, 'password')
        }
      });
    })
    .catch(function(err) {
      return res.status(404).json({ errors: {error: 'Error finding the current user'} });
    });
  },

  /*
    @action PUT update
    Update the user

    @params {number} request.params.id - the user ID
    @param {object} request body - will contain the user to update
    {
      data: {
        type: 'user',
        id: {number},
        attributes: {object}
      }
    }

    @responds with {
                      meta: {token: {string}}
                    }
  */
  update: function(req, res) {
    if(!req.body || !req.body.data || !req.body.data.attributes) {
      console.log('User not sent with the update request');
      return res.status(400).json({ errors: {error: 'Error saving profile changes'} });
    }

    // Check whether the user has authorization to update
    if(parseInt(req.user.id) !== parseInt(req.params.id)) {
      return res.status(401).json({ errors: {error: 'Not authorized to edit that account'} });
    }

    User.forge({id: req.params.id}).fetch({require: true}).tap(function(user) {
      user.save(privateMethods._permittedUpdateParams(req.body.data.attributes), {patch: true}).then(function(user) {
        var token = jwt.sign(user, jwtSecret);
        return res.json({ meta: {token: token} });
      });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ errors: {error: 'Error saving profile changes'} });
    });
  },

  /*
    @action PUT changePassword
    Change the user password

    @params {number} request.params.id - the user ID
    @param {object} request.body - will contain the user passwords
    {
      data: {
        type: 'user',
        id: {number},
        attributes: {
          oldPassword: {string},
          newPassword: {string}
        }
      }
    }

    @responds with {
                      meta: {token: {string}}
                    }
  */
  changePassword: function(req, res) {
    if(!req.body || !req.body.data || !req.body.data.attributes) {
      console.log('User not sent with the change password request');
      return res.status(400).json({ errors: {error: 'Error changing password'} });
    }

    if(parseInt(req.body.data.id) !== parseInt(req.user.id)) {
      return res.status(400).json({ errors: { error: 'Only a user can update their own password' } });
    }

    User.forge({id: req.user.id}).fetch({require: true}).tap(function(user) {
      user.verifyPassword(req.body.data.attributes.oldPassword).then(function(passMatch) {
        if(passMatch) {
          user.setPassword(req.body.data.attributes.newPassword).then(function(user) {
            var token = jwt.sign(user, jwtSecret);
            return res.status(201).json({ meta: {token: token} });
          });
        } else {
          throw new Error('Incorrect Password');
        }
      })
      .catch(function(err) {
        console.log(err);
        return res.status(500).json({ errors: {error: 'Incorrect password'} });
      });
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ errors: {error: 'Error changing password'} });
    });
  },

  /*
    @action GET verifyUser
    Verify the user from email

    @params {number} request.params.id - the user id
    @params {string} request.query.verification - the verification code for the user

    @responds with redirect to the root url, with
    req.session.context = {
      meta: {
        jwtToken: The session token,
        success: The success message
      }
    }
    OR
    req.session.context = { errors: {error: The error message} }
  */
  verifyUser: function(req, res) {
    User.forge({id: req.params.id}).fetch({require: true}).tap(function(user) {
      user.checkVerification(req.query.verification)
      .then(function() {
        var token = jwt.sign(user, jwtSecret);
        req.session.context = {
          meta: {
            jwtToken: token,
            success: "Thanks for joining! We're glad to have you"
          }
        };
        res.redirect('/');
      })
      .catch(function(err) {
        console.log(err);
        req.session.context = {
          errors: {error: "There was an error verifying your account. Please reach out to us with your situation!"}
        };
        res.redirect('/');
      });
    })
    .catch(function(err) {
      console.log(err);
      req.session.context = {
        errors: {error: "There was an error verifying your account. Please reach out to us with your situation!"}
      };
      res.redirect('/');
    });
  },

  /*
    @action POST recoverPassword
    Create a PasswordReset code for the user

    @params {object} request.body - will contain the user email
    {
      data: {
        type: 'user',
        id: {number},
        attributes: {
          email: {string},
        }
      }
    }

    @responds with {
                      meta: {token: {string}}
                    }
  */
  recoverPassword: function(req, res) {
    if(!req.body.data || !req.body.data.attributes || !req.body.data.attributes.email) {
      console.log('User not sent with the recover password request');
      return res.status(400).json({ errors: {error: 'Error recovering password'} });
    }

    User.forge({email: req.body.data.attributes.email}).fetch({require: true}).then(function(user) {
      user.resetPassword()
      .then(function() {
        res.status(201).json({ meta: {success: 'Please check your email for further instructions'} });
      });
    })
    .catch(User.NotFoundError, function(err) {
      console.log(err);
      res.status(400).json({ errors: {error: "Couldn't find an account associated with this email"} });
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({ errors: {error: 'There was a problem resetting your password. Please contact support'} });
    });
  },

  /*
    @action PUT resetPassword
    Check the PasswordReset and update the password

    @params {object} request.body - will contain the user email
    {
      data: {
        type: 'passwordResets',
        id: null,
        attributes: {
          resetCode: {string},
        },
        relationships: {
          user: {
            data: { newPassword: {string} }
          }
        }
      }
    }

    @responds with {
                      meta: {token: {string}}
                    }
  */
  resetPassword: function(req, res) {
    if(!req.body.data || !req.body.data.attributes || !req.body.data.attributes.resetCode) {
      return res.status(400).json({ errors: {error: 'Error reseting password'} });
    }

    PasswordReset.forge({resetCode: req.body.data.attributes.resetCode}).fetch({require: true, withRelated: ['user']}).then(function(passReset) {
      // Check whether the passReset has been created in the last hour
      var passResetTime = moment(passReset.get('createdAt'));
      var anHourAgo = moment().subtract(1, 'hour');

      if(passResetTime.isAfter(anHourAgo)) {
        var user = passReset.related('user');

        user.setPassword(req.body.data.attributes.newPassword).then(function(user) {
          var token = jwt.sign(user, jwtSecret);

          passReset.destroy();
          return res.status(201).json({ meta: {token: token} });
        });
      } else {
        passReset.destroy();
        return res.status(400).json({ errors: {error: 'The reset code has expired. Please visit the forgot password page'} });
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ errors: {error: 'Error reseting password'} });
    });
  }

  // PRIVATE
    
};

var privateMethods = {
  /*
    @object _permittedUpdateParams
    @private

    @params {object} attrs - the request attributes
    @returns {object} the filtered attributes
  */
  _permittedUpdateParams: function(attrs) {
    return _.pick(attrs, 'firstName', 'lastName', 'email', 'mailingList');
  },
}