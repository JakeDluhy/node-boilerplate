var connection = require('./environments/' + process.env.NODE_ENV).database;
// Connect to the postgres database using the connection defined in the 
var knex = require('knex')({
  client: 'pg',
  connection: connection
});

// Create the bookshelf instance using the knex connection
var bookshelf = require('bookshelf')(knex);
// Use the bookshelf registry plugin to avoid dependancy loops
bookshelf.plugin('registry');

module.exports = bookshelf;