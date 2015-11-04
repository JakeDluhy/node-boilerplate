var assign = require('object-assign');
let jwt_decode = require('jwt-decode');
let objectAssign = require('object-assign');

let AppDispatcher = require('../dispatcher/app');
let LoginConstants = require('../constants/login-constants.js');
let BaseStore = require('./base-store');

var LoginStore = assign({}, BaseStore, {
  _modalOpen: false,
  _isRegistering: false,
  _formErrors: {},

  getUser() {
    return this._user;
  },

  getJwt() {
    return this._jwt;
  },

  isLoggedIn() {
    return !!this._user;
  },

  isModalOpen() {
    return this._modalOpen;
  },

  isRegistering() {
    return this._isRegistering;
  },

  getReqHeaders() {
    return { 'authorization': 'Bearer ' + this._jwt};
  },

  getFormErrors() {
    return this._formErrors;
  }
});

AppDispatcher.register(function(payload) {
  switch(payload.actionType) {
      case LoginConstants.LOGIN_USER:
        LoginStore._jwt = payload.jwt;
        LoginStore._user = jwt_decode(LoginStore._jwt);
        LoginStore.emitChange();
        break;
      case LoginConstants.OPEN_LOGIN_MODAL:
        LoginStore._modalOpen = true;
        LoginStore.emitChange();
        break;
      case LoginConstants.CLOSE_LOGIN_MODAL:
        LoginStore._modalOpen = false;
        LoginStore.emitChange();
        break;
      case LoginConstants.LOGOUT_USER:
        LoginStore._user = null;
        LoginStore.emitChange();
        break;
      case LoginConstants.REGISTERING:
        LoginStore._isRegistering = payload.isRegistering;
        LoginStore.emitChange();
        break;
      case LoginConstants.AUTH_ERRORS:
        LoginStore._formErrors = objectAssign(LoginStore._formErrors, payload.formErrors);
        LoginStore.emitChange();
        break;
      default:
        break;
    };
});

module.exports = LoginStore;