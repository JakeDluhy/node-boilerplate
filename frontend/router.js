let React = require('react');
let Router = require('react-router').Router;
let Route = require('react-router').Route;
let IndexRoute = require('react-router').IndexRoute;
let createBrowserHistory = require('history/lib/createBrowserHistory');

let ApplicationWrapper = require('./views/application-wrapper');
let Index = require('./views/layout/index');
let UserSettings = require('./views/user/settings');
let RecoverPassword = require('./views/user/recover-password');

let routes =  (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={ApplicationWrapper}>
      <IndexRoute component={Index} />
      <Route path="/users/settings" component={UserSettings} onEnter={UserSettings.onEnter} />
      <Route path="forgot" component={RecoverPassword} />
    </Route>
  </Router>
  
);

module.exports = routes;