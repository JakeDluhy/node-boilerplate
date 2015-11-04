var Promise = require('bluebird');
// var request = Promise.promisifyAll(require('request'));
var request = require('request');
var md5 = require('md5');
var apiKey = require('./environments/' + process.env.NODE_ENV).mailchimp.apiKey;
var apiRoot = require('./environments/' + process.env.NODE_ENV).mailchimp.apiRoot;
var mailingListId = require('./environments/' + process.env.NODE_ENV).mailchimp.mailingListId;
var signupPathCategory = require('./environments/' + process.env.NODE_ENV).mailchimp.signupPathCategory;

var Mailchimp = {
  defaultOptions: {
    host: apiRoot,
    headers: {
      'Content-Type': 'JSON'
    }
  },

  sendReq: Promise.method(function(requestPath, requestMethod, requestData) {
    request({
      url: apiRoot + requestPath,
      method: requestMethod,
      json: true,
      auth: {
        user: 'helloMailchimp',
        pass: apiKey
      },
      body: requestData
    }, function(err, httpResponse, body) {
      if(err) {
        throw new Error(err);
      }
      return body;
    });
  }),

  addUserToList: Promise.method(function(email, groupCategory, firstName, lastName) {
    var formData = {
      "email_address": email, 
      "status": "subscribed",
      "merge_fields" : {},
      "interests": {}
    }
    if(signupPathCategory[groupCategory+'Id']) formData["interests"][signupPathCategory[groupCategory+'Id']] = true;
    if(firstName) formData["merge_fields"]["FNAME"] = firstName;
    if(lastName) formData["merge_fields"]["LNAME"] = lastName;
    return this.sendReq('lists/'+mailingListId+'/members/', 'POST', formData);
  }),

  getUserSubscription: Promise.method(function(email) {
    var hashedEmail = md5.digest(email.toLowerCase());
    return this.sendReq('lists/'+mailingListId+'/members/'+hashedEmail, 'GET')
    .then(function(data) {
      console.log(data);
    })
    .catch(function(e) {
      console.log(e);
    });
  })
}

module.exports = Mailchimp;

// Use request