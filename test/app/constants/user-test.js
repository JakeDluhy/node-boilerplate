var PATH_TO_ROOT = '../../..';

/*
  IMPORT TEST HELPERS
*/
var assert = require('chai').assert;

/*
  CONSTANTS
*/
var UserConstants = require(PATH_TO_ROOT+'/app/constants/user');

describe('User Constants', function() {
  it('should include all of the activation values', function () {
    assert.equal(0, UserConstants.USER_UNVERIFIED);
    assert.equal(1, UserConstants.USER_VERIFIED);
    assert.equal(2, UserConstants.USER_INACTIVE);
  });
});