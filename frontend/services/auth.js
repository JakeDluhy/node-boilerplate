var request = require('reqwest');
var LoginActions = require('../actions/login-actions');
var LoginStore = require('../stores/login-store');
let FlashActions = require('../actions/flash-actions');

var AuthService = {
  login(email, password, rememberMe) {
    return request({
      url: '/api/login',
      method: 'POST',
      type: 'json',
      data: {
        email: email,
        password: password
      }
    })
    .then(function(response) {
      if(response.errorType === 'notVerifiedError') {
        FlashActions.newFlash('error', response.error);
        LoginActions.closeLoginModal();
      } else if(response.errorType === 'notFoundError') {
        LoginActions.formErrors({emailError: response.error});
      } else if(response.errorType === 'invalidPasswordError') {
        LoginActions.formErrors({passwordError: response.error});
      } else if(response.errorType === undefined) {
        FlashActions.newFlash('success', "You're in! Welcome back!");
        return this.loginUser(response.token, rememberMe);
      }
    }.bind(this))
    .catch(function(response) {
      LoginActions.closeLoginModal();
      FlashActions.newFlash('error', 'Unknown error with login. Please contact support');
    });
  },
  register(userData) {
    return request({
      url: '/api/register',
      method: 'POST',
      type: 'json',
      data: {
        user: userData
      }
    })
    .then(function(response) {
      if(response.error) {
        FlashActions.newFlash('error', 'Error registering: ' + response.error);
        LoginActions.closeLoginModal();
      } else {
        FlashActions.newFlash('success', response.success);
        LoginActions.closeLoginModal();
        LoginActions.registering(false);
      }
    }.bind(this))
  },
  registerForMailingList(email) {
    return request({
      url: '/api/mailing_list',
      method: 'POST',
      type: 'json',
      data: {
        email: email
      }
    })
    .then(function(response) {
      if(response.error) FlashActions.newFlash('error', response.error);
      if(response.success) FlashActions.newFlash('success', response.success);
    })
    .catch(function(err) {
      console.log(err);
    });
  },

  loginUser(token, rememberMe) {
    if(!token) {return false;}
    let jwt = token;

    LoginActions.loginUser(jwt, rememberMe);
    LoginActions.closeLoginModal();
    return true;
  },

  updateProfile(userData) {
    var self = this;
    return request({
      url: '/api/users/'+userData['id'],
      headers: LoginStore.getReqHeaders(),
      method: 'PUT',
      type: 'json',
      data: {
        user: userData
      }
    })
    .then(function(response) {
      if(response.error) {
        FlashActions.newFlash('error', 'Error updating: ' + response.error);
      } else {
        FlashActions.newFlash('success', 'New profile saved');
        return self.loginUser(response.token);
      }
    });
  },

  changePassword(passwordData) {
    var self = this;
    return request({
      url: '/api/users/'+passwordData['id']+'/change_password',
      headers: LoginStore.getReqHeaders(),
      method: 'PUT',
      type: 'json',
      data: {
        user: passwordData
      }
    })
    .then(function(response) {
      if(response.error) {
        FlashActions.newFlash('error', 'Error changing password: ' + response.error);
      } else {
        FlashActions.newFlash('success', 'Password updated');
        return self.loginUser(response.token);
      }
    });
  },

  recoverPassword(email) {
    var self = this;
    console.log(email);
    return request({
      url: '/api/recover_password',
      method: 'POST',
      type: 'json',
      data: {
        email: email
      }
    })
    .then(function(response) {
      if(response.error) {
        FlashActions.newFlash('error', response.error);
      } else {
        FlashActions.newFlash('success', response.success);
      }
    });
  }
}

module.exports = AuthService;