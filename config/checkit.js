var Checkit = require('checkit');
var knex = require('./database').knex;

/*
  Checkit unique validator
  Validates whether the value in the table is unique
  Called using unique:(tableName):(columnName)
  
  Example:
  var userValidation = new Checkit({
    email: ['email', 'unique:users:email']
  })
*/
Checkit.Validator.prototype.unique = function(val, table, column) {
  return knex(table).where(column, '=', val).then(function(resp) {
    if(resp.length > 0) throw new Error(column + ' must be unique. ' + val + ' already exists.');
  });
}

module.exports = Checkit;