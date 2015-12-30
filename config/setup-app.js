/*
  CREATE APP
*/
var express = require('express');
var app = express();

/*
  REQUIRE MIDDLEWARE
*/
var exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local');

/*
  ENVIRONMENT CONFIG
*/
var knex = require('./database').knex,
    databaseConfig = require('./environments/'+process.env.NODE_ENV).database,
    sessionSecret = require('./environments/'+process.env.NODE_ENV).sessionSecret;

/*
  EXTERNAL MODULES
*/
var User = require('../app/models/user'),
    routes = require('../app/routes');

/*
  Set the app port based on environment, defaulting to 8080
*/
app.set('port', process.env.PORT || 8080);

/*
  If production environment, run the latest migrations
*/
if(process.env.NODE_ENV === 'production') {
  knex.migrate.latest(databaseConfig).catch(function(err) {
    console.log(err);
  });
}

/*
  Set up handlebars renderer, specifying view directory, default template to render, and the view engine
*/
app.set('views', __dirname + '/../app/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'index',
    layoutsDir: app.get('views') + '/layouts'
}));
app.set('view engine', 'handlebars');

/*
  Execute middleware
*/
// Static file path
app.use(express.static(__dirname + '/../public'));
// Session with secret key
app.use(session({secret: sessionSecret}));
// Specify necessary body parser methods
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// Init passport
app.use(passport.initialize());

// Register the routes
routes.initialize(app);

module.exports = app;