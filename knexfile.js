var connection = require('./config/environments/' + process.env.NODE_ENV).database;

exports.development = exports.test = exports.staging = exports.production = {
  client: 'pg',
  connection: connection
}