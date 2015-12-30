/*
  IMPORT PACKAGES
*/
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/*
  EXTERNAL MODULES
*/
var User = require('../app/models/user');

/*
  @method passport LocalStrategy
  Middleware to authenticate a user on the login route

  @params {object} request - the request in the following format
  {
    email: {string},
    password: {string}
  }

  @returns done callback
  with user @if user is authenticated and active
  with errorType, error object @if user is rejected for a specified reason - for custom error handling
*/
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.login(email, password)
    .then(function(user) {
      if(user.attributes.active === 1) {
        return done(null, user.omit('password'));
      } else {
        return done(null, {errorType: 'notVerifiedError', error: 'Your account is not verified. Please check your email'});
      }
    }).catch(User.NotFoundError, function() {
      return done(null, {errorType: 'notFoundError', error: 'No account exists with this email'});
    }).catch(function(err) {
      if(err.message === 'invalidPassword') {
        return done(null, {errorType: 'invalidPasswordError', error: 'Invalid Password'});
      } else if(err.message === 'notVerified') {
        return done(null, {errorType: 'notVerifiedError', error: 'Your account is not verified. Please check your email'});
      } else {
        console.log(err);
        return done(null, false, err);
      }
    });
  }
));

module.exports = passport;