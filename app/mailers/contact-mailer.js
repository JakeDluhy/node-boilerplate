/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');

/*
  ENVIRONMENT CONFIG
*/
var feedbackEmail = require('../../config/environments/'+process.env.NODE_ENV).feedbackEmail;

/*
  EXTERNAL MODULES
*/
var mailer = require('../../config/nodemailer');
var emailDefault = require('../constants/mailers');
var hbs = require('../../config/handlebars');

module.exports = {
  /*
    @method sendContactForm
    Use nodemailer to send the contact form to the intended recipient

    @param {object} params - an object containing the context for the email
    {
      @optional subject: {string},
      @required fromEmailL {string},
      @required content: {string},
      @optional name: {string}
    }

    @returns Promise that resolves if successful send, rejects with error message on failure
  */
  sendContactForm: Promise.method(function(params) {
    var context = {};
    context['email'] = params;
    context['default'] = emailDefault;
    if(params && params.fromEmail && params.content) {
      return hbs.render('./app/views/mailers/contact.handlebars', context)
      .then(function(renderedString) {
        return mailer.sendMailAsync({
          from: params.fromEmail,
          to: feedbackEmail,
          subject: params.subject,
          text: params.fromEmail + '\r\n' + params.content + '\r\nFrom: ' + params.name,
          html: renderedString
        })
        .catch(function(err) {
          console.log(err);
          throw new Error('Error mailing contact form');
        });
      })
      .catch(function(err) {
        console.log(err);
        throw new Error('Error rendering template');
      });
      
    } else {
      throw new Error('Email or body unspecified');
    }
  })
}