/*
  IMPORT PACKAGES
*/
var Promise = require('bluebird');
var _ = require('lodash');
var md5 = require('md5');

/*
  EXTERNAL MODULES
*/
var bookshelf = require('../../config/database');
var BaseModel = require('./base-model');
var Checkit = require('../../config/checkit');

/*
  MODELS
*/
var User = require('./user');

/*
  PASSWORD RESET MODEL
*/
var PasswordReset = BaseModel.extend({
  tableName: 'password_resets',

  initialize: function() {

  },

  // CALLBACKS

  // RELATIONS
  user: function() {
    return this.belongsTo('User');
  }

  // passwordReset methods

    // Private methods
    
}, {
  // PasswordReset methods

  /*
    @method createReset
    Creates a reset key for a given user, using md5 hashing of a random string to create a random code

    @param {number} userId - the user ID

    @returns Promise that resolves to the reset code that has been generated, rejects to a failed save
  */
  createReset: Promise.method(function(userId) {
    var passwordCode = md5(Math.random().toString(36));
    return PasswordReset.forge({
      resetCode: passwordCode,
      userId: userId
    })
    .save()
    .then(function() {
      return passwordCode;
    });
  })
  
    // Private methods
});

module.exports = bookshelf.model('PasswordReset', PasswordReset);