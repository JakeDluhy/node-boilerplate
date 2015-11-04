var bookshelf = require('../../config/database');
var _ = require('lodash');

var BaseModel = bookshelf.Model.extend({
  hasTimestamps: true,

  parse: function(attrs) {
    return _.reduce(attrs, function(memo, val, key) {
      memo[_.camelCase(key)] = val;
      return memo;
    }, {});
  }, 

  format: function(attrs) {
    return _.reduce(attrs, function(memo, val, key) {
      memo[_.snakeCase(key)] = val;
      return memo;
    }, {});
  }
}, {
  
});

module.exports = BaseModel;