var express = require('express'),
    app = express(),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    knex = require('./database').knex,
    databaseConfig = require('./environments/'+process.env.NODE_ENV).database,
    session = require('express-session'),
    sessionSecret = require('./environments/'+process.env.NODE_ENV).sessionSecret,
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('../app/models/user'),
    routes = require('../app/routes');

app.set('port', process.env.PORT || 8080);
if(process.env.NODE_ENV === 'production') {
  knex.migrate.latest(databaseConfig).catch(function(err) {
    console.log(err);
  });
}

app.set('views', __dirname + '/../app/views');
app.engine('handlebars', exphbs({
    defaultLayout: 'index',
    layoutsDir: app.get('views') + '/layouts'
}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/../public'));
app.use(session({secret: sessionSecret}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(passport.initialize());

routes.initialize(app);

module.exports = app;