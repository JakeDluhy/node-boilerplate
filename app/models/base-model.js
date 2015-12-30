/*
  IMPORT PACKAGES
*/
var _ = require('lodash');

/*
  EXTERNAL MODULES
*/
var bookshelf = require('../../config/database');

/*
  BASE MODEL
*/
var BaseModel = bookshelf.Model.extend({
  hasTimestamps: true,

  /*
    @method parse
    Function to parse the attributes from the database to camel case

    @param {object} attrs - The model attributes

    @returns {object} attrs - The model attributes converted to camel case
  */
  parse: function(attrs) {
    return _.reduce(attrs, function(memo, val, key) {
      memo[_.camelCase(key)] = val;
      return memo;
    }, {});
  }, 

  /*
    @method format
    Function to format the attributes for the database

    @param {object} attrs - The model attributes

    @returns {object} attrs - The model attributes converted to snake case
  */
  format: function(attrs) {
    return _.reduce(attrs, function(memo, val, key) {
      memo[_.snakeCase(key)] = val;
      return memo;
    }, {});
  }
}, {
  
});

module.exports = BaseModel;