var express = require('express');

var passport = require('../config/strategies');
var expressJwt = require('express-jwt');
var env = require('../config/environments/' + process.env.NODE_ENV);

var home = require('./controllers/home');
var armies = require('./controllers/armies');
var users = require('./controllers/users');

var apiRouter = express.Router();
apiRouter.post('/login', passport.authenticate('local', {session: false}), home.login);
apiRouter.post('/register', home.register);
apiRouter.post('/mailing_list', home.registerForMailingList);
apiRouter.post('/contact', home.sendContactForm);
apiRouter.get('/verify/:id', users.verifyUser);
apiRouter.post('/recover_password', users.recoverPassword);

var userRouter = express.Router();
userRouter.use('/*', expressJwt({secret: env.jwtSecret}));
userRouter.put('/:id', users.update);
userRouter.put('/:id/change_password', users.changePassword);
apiRouter.use('/users', userRouter);

module.exports.initialize = function(app) {
  app.use('/api', apiRouter);
  app.get('/*', home.index);
}