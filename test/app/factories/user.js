var PATH_TO_ROOT = '../../..';

/*
  IMPORT PACKAGES
*/
var factory = require('factory-girl');
require('factory-girl-bookshelf')();

/*
  MODELS
*/
var User = require(PATH_TO_ROOT+'/app/models/user');

/*
  USER FACTORY
*/
module.exports = {
  mainUser: factory.define('user', User, {
    firstName: factory.sequence(function(n) {
      var num = Math.random()*100001|0;
      return 'user ' + num;
    }),
    lastName: factory.sequence(function(n) {
      var num = Math.random()*100001|0;
      return 'the ' + num;
    }),
    email: factory.sequence(function(n) {
      var num = Math.random()*100001|0;
      return 'user' + num + '@demo.com'
    }),
    password: 'foobarchoo'
  }, {
    afterCreate: function(user, options, cb) {
      if(options.hashPass) {
        User.hashPassword(user.get('password'))
        .then(function(hashedPass) {
          user.set({password: hashedPass}).save()
          .then(function(user) {
            cb(false, user);
          })
          .catch(function(err) {
            console.log(err);
            cb(err, user);
          });
        });
      } else {
        return cb(false, user);
      }
    }
  }),
  mailingListUser: factory.define('mailingListUser', User, {
    email: factory.sequence(function(n) {
      var num = Math.random()*100001|0;
      return 'user' + num + '@demo.com'
    })
  })
};