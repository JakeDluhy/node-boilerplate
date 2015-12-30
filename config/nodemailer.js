/*
  IMPORT PACKAGES
*/
var nodemailer = require('nodemailer');
var Promise = require('bluebird');

/*
  ENVIRONMENT CONFIG
*/
var config = require('./environments/' + process.env.NODE_ENV).nodemailer;

// Create the nodemailer transporter, and Promisify the methods
// User service gmail, and config in the environment file
var transporter = Promise.promisifyAll(nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.username,
    pass: config.password
  }
}));

module.exports = transporter;