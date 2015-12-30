/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');

/*
  ENVIRONMENT CONFIG
*/
var contactEmail = require('../../config/environments/'+process.env.NODE_ENV).contactEmail;

/*
  EXTERNAL MODULES
*/
var mailer = require('../../config/nodemailer');
var emailDefault = require('../constants/mailers');
var hbs = require('../../config/handlebars');


module.exports = {
  /*
    @method sendVerificationEmail
    Use nodemailer to send the verification email to the newly registered user

    @param {object} params - an object containing the context for the email
    {
      @optional firstName: {string},
      @required email: {string},
      @required verificationLink: {string},
    }

    @returns Promise that resolves if successful send, rejects with error message on failure
  */
  sendVerificationEmail: Promise.method(function(params) {
    var context = {};
    context['default'] = emailDefault;
    context['verification'] = params;
    if(params && params.email && params.verificationLink) {
      return hbs.render('./app/views/mailers/verify.handlebars', context)
      .then(function(renderedString) {
        return mailer.sendMailAsync({
          from: contactEmail,
          to: params.email,
          subject: 'Verify your account',
          text: 'Please verify your account at ' + params.verificationLink,
          html: renderedString
        })
        .catch(function(err) {
          console.log(err);
          throw new Error('Error sending the email');
        });
      })
      .catch(function(err) {
        console.log(err);
        throw new Error('Error rendering template');
      });
    } else {
      throw new Error('Email or link unspecified');
    }
  }),

  /*
    @method sendRecoverPasswordEmail
    Use nodemailer to send the email to recover a user's password

    @param {object} params - an object containing the context for the email
    {
      @optional firstName: {string},
      @required email: {string},
      @required resetLink: {string},
    }

    @returns Promise that resolves if successful send, rejects with error message on failure
  */
  sendRecoverPasswordEmail: Promise.method(function(params) {
    var context = {};
    params.contactEmail = contactEmail;
    
    context['default'] = emailDefault;
    context['verification'] = params;
    if(params && params.email && params.resetLink) {
      return hbs.render('./app/views/mailers/recover.handlebars', context)
      .then(function(renderedString) {
        return mailer.sendMailAsync({
          from: contactEmail,
          to: params.email,
          subject: 'Recover your password',
          text: 'We received a request to reset your password. Please visit ' + params.resetLink + ' to complete the reset process. You have one hour to complete it, after which you will have to request another reset. If you did not request this please contact us at ' + contactEmail,
          html: renderedString
        })
        .catch(function(err) {
          console.log(err);
          throw new Error('Error sending the email');
        });
      })
      .catch(function(err) {
        console.log(err);
        throw new Error('Error rendering template');
      });
    } else {
      throw new Error('Email or password unspecified');
    }
  })
}