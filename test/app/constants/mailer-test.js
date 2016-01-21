var PATH_TO_ROOT = '../../..';

/*
  IMPORT TEST HELPERS
*/
var assert = require('chai').assert;

/*
  ENVIRONMENT CONFIG
*/
var rootUrl = require(PATH_TO_ROOT+'/config/environments/test').rootUrl;
var companyName = require(PATH_TO_ROOT+'/config/environments/test').companyName;

/*
  CONSTANTS
*/
var MailerConstants = require(PATH_TO_ROOT+'/app/constants/mailers');

describe('Mailer Constants', function() {
  it('should include the company name', function () {
    assert.equal(companyName, MailerConstants.company);
  });

  it('should have the update profile url', function() {
    assert.equal(rootUrl+'/profile', MailerConstants.updateProfile);
  });

  it('should have the unsubscribe url', function() {
    assert.equal(rootUrl+'/unsubscribe', MailerConstants.unsubscribe);
  })
});
