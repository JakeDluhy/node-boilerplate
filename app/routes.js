var express = require('express');

var passport = require('../config/strategies');
var expressJwt = require('express-jwt');
var env = require('../config/environments/' + process.env.NODE_ENV);

var home = require('./controllers/home');
var users = require('./controllers/users');

/*
  Api Root routes
  /api
*/
var apiRouter = express.Router();
// Authenticate through passport
apiRouter.post('/login', passport.authenticate('local', {session: false}), home.login);
apiRouter.post('/register', home.register);
apiRouter.post('/mailing_list', home.registerForMailingList);
apiRouter.post('/contact', home.sendContactForm);
// Verify a user with id
apiRouter.get('/verify/:id(\\d+)', users.verifyUser);
// Forgot password recorvery
apiRouter.post('/recover_password', users.recoverPassword);

/*
  Api Users routes
  /api/users
*/
var unverifiedUserRouter = express.Router();
unverifiedUserRouter.put('/reset_password', users.resetPassword);
// Match numeric id
unverifiedUserRouter.get('/:id(\\d+)', users.show);
apiRouter.use('/users', unverifiedUserRouter);
var userRouter = express.Router();
// Verify all requests
userRouter.use('/*', expressJwt({secret: env.jwtSecret}));
userRouter.get('/current_user', users.currentUser);
// Match numeric id
userRouter.put('/:id(\\d+)', users.update);
// Match numeric id
userRouter.put('/:id(\\d+)/change_password', users.changePassword);
apiRouter.use('/users', userRouter);


module.exports.initialize = function(app) {
  // Respond to /api if request is prefixed with that, otherwise render the page
  app.use('/api', apiRouter);
  app.get('/*', home.index);
}