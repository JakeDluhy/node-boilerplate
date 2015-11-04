var mailer = require('../../config/nodemailer');
var emailDefault = require('../constants/mailers');
var hbs = require('../../config/handlebars');
var Promise = require('bluebird');

var feedbackEmail = require('../../config/environments/'+process.env.NODE_ENV).feedbackEmail;

module.exports = {
  sendContactForm: Promise.method(function(params) {
    var context = {};
    context['email'] = params;
    context['default'] = emailDefault;
    if(params && params['fromEmail'] && params['content']) {
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
          console.log(err)
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