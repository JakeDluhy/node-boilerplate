/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');
var request = require('request');
var md5 = require('md5');

/*
  ENVIRONMENT CONFIG
*/
var mailchimp = require('./environments/' + process.env.NODE_ENV).mailchimp;
var apiKey = mailchimp.apiKey;
var apiRoot = mailchimp.apiRoot;
var mailingListId = mailchimp.mailingListId;
var signupPathCategory = mailchimp.signupPathCategory;

/*
  Mailchimp class
*/
var Mailchimp = {
  // Mailchimp default options
  defaultOptions: {
    host: apiRoot,
    headers: {
      'Content-Type': 'JSON'
    }
  },

  /*
    @method sendReq
    Default method to send a request to the mailchimp api

    @param {string} requestPath - the api path to send the request to
    @param {string} requestMethod - the http request method (GET, PUT, POST, DELETE)
    @param{optional} {object} requestData - the data to include with the request

    @returns {promise} resolves to the body of the response
                       rejected with the error message of a bad request
  */
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

  /*
    @method addUserToList
    Add a user to the mailing list specified in the environment file

    @param {string} email - the email of the mailing list subscriber
    @param {string} groupCategory - the category to designate the user as (ex. registeredUser or mailingList)
    @param{optional} {string} firstName - the first name of the user
    @param{optional} {string} lastName - the last name of the user

    @returns {promise} that will always resolve to the sendReq method
  */
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

  /*
    @method removeUserFromList
    Remove a user from the mailing list

    @param {string} email - the email of the mailing list subscriber

    @returns {promise} that will always resolve to the sendReq method
  */
  removeUserFromList: Promise.method(function(email) {
    var hashedEmail = md5(email.toLowerCase());

    return this.sendReq('lists/'+mailingListId+'/members/'+hashedEmail, 'DELETE');
  }),

  /*
    @method removeUserFromList
    Get a users subscription

    @param {string} email - the email of the mailing list subscriber

    @returns {promise} that will always resolve to the sendReq method
  */
  getUserSubscription: Promise.method(function(email) {
    var hashedEmail = md5(email.toLowerCase());
    
    return this.sendReq('lists/'+mailingListId+'/members/'+hashedEmail, 'GET');
  })
}

module.exports = Mailchimp;

// Use request