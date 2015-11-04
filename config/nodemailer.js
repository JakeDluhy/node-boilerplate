var nodemailer = require('nodemailer');
var Promise = require('bluebird');
var config = require('./environments/' + process.env.NODE_ENV).nodemailer;

var transporter = Promise.promisifyAll(nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.username,
    pass: config.password
  }
}));

module.exports = transporter;