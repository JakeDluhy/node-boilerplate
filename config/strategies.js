var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');

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
      console.error(err);
      if(err.message === 'invalidPassword') {
        return done(null, {errorType: 'invalidPasswordError', error: 'Invalid Password'});
      } else if(err.message === 'notVerified') {
        return done(null, {errorType: 'notVerifiedError', error: 'Your account is not verified. Please check your email'});
      } else {
        return done(null, false, err);
      }
    });
  }
));

module.exports = passport;