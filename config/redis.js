/*
  IMPORT PACKAGES
*/
var Redis = require('ioredis');

/*
  ENVIRONMENT CONFIG
*/
var redisConfig = require('./environments/' + process.env.NODE_ENV).redis;

// Create the redis connection
var redis = new Redis(redisConfig);

module.exports = redis;