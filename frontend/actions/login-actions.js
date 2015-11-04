let AppDispatcher = require('../dispatcher/app');
let LoginConstants = require('../constants/login-constants');

module.exports = {
  loginUser: function(jwt, rememberMe) {
    if(rememberMe) {
      localStorage.setItem('jwt', jwt);  
    } else {
      sessionStorage.setItem('jwt', jwt);
    }
    
    AppDispatcher.dispatch({
      actionType: LoginConstants.LOGIN_USER,
      jwt: jwt,
    });
  },
  openLoginModal: function() {
    AppDispatcher.dispatch({
      actionType: LoginConstants.OPEN_LOGIN_MODAL
    })
  },
  closeLoginModal: function() {
    AppDispatcher.dispatch({
      actionType: LoginConstants.CLOSE_LOGIN_MODAL
    })
  },
  logoutUser: function() {
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
    AppDispatcher.dispatch({
      actionType: LoginConstants.LOGOUT_USER
    });
  },
  registering: function(isRegistering) {
    AppDispatcher.dispatch({
      actionType: LoginConstants.REGISTERING,
      isRegistering: isRegistering
    })
  },

  // authErrors is an object of type {
  //   emailError: 'An error',
  //   passwordError: 'An error'
  // }
  formErrors: function(authErrors) {
    AppDispatcher.dispatch({
      actionType: LoginConstants.AUTH_ERRORS,
      formErrors: authErrors
    })
  }
}