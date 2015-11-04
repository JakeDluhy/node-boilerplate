var connection = require('./environments/' + process.env.NODE_ENV).database;
var knex = require('knex')({
  client: 'pg',
  connection: connection
});

var bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;