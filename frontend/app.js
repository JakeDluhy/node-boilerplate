(function() {

  let React = require('react');
  let Router = require('react-router');
  let Route = Router.Route;
  let Routes = require('./router');
  let LoginActions = require('./actions/login-actions');
  let FlashActions = require('./actions/flash-actions');

  let jwt = localStorage.getItem('jwt');
  if(!jwt) jwt = sessionStorage.getItem('jwt');
  if(jwt) LoginActions.loginUser(jwt);

  if(typeof Message !== "undefined" && Message instanceof Array) {
    FlashActions.newFlash(Message[0], Message[1]);
  }

  React.render(Routes, document.body);

})();

  