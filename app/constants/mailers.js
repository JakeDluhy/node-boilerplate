/*
  Set environment config
*/
var rootUrl = require('../../config/environments/'+process.env.NODE_ENV).rootUrl;
var companyName = require('../../config/environments/'+process.env.NODE_ENV).companyName;

/*
  Export the default information to be sent with every email
*/
module.exports = {
  company: companyName,
  updateProfile: rootUrl + '/profile',
  unsubscribe: rootUrl + '/unsubscribe'
}