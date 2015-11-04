let AppDispatcher = require('../dispatcher/app');
let ContactConstants = require('../constants/contact-constants');

module.exports = {
  openContactModal: function() {
    AppDispatcher.dispatch({
      actionType: ContactConstants.OPEN_CONTACT_MODAL
    })
  },
  closeContactModal: function() {
    AppDispatcher.dispatch({
      actionType: ContactConstants.CLOSE_CONTACT_MODAL
    })
  }
}