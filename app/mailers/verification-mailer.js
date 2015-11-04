var mailer = require('../../config/nodemailer');
var emailDefault = require('../constants/mailers');
var hbs = require('../../config/handlebars');
var Promise = require('bluebird');

var contactEmail = require('../../config/environments/'+process.env.NODE_ENV).contactEmail;

module.exports = {
  sendVerificationEmail: Promise.method(function(params) {
    var context = {};
    context['default'] = emailDefault;
    context['verification'] = params;
    if(params && params['email'] && params['verificationLink']) {
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

  sendRecoverPasswordEmail: Promise.method(function(params) {
    var context = {};
    context['default'] = emailDefault;
    context['verification'] = params;
    if(params && params['email'] && params['password']) {
      return hbs.render('./app/views/mailers/recover.handlebars', context)
      .then(function(renderedString) {
        return mailer.sendMailAsync({
          from: contactEmail,
          to: params.email,
          subject: 'Recover your password',
          text: 'We have reset your password. It is now ' + params.password + '. Please log in and change the reset password as soon as possible.',
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