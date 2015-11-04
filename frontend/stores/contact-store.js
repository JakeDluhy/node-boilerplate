var assign = require('object-assign');

let AppDispatcher = require('../dispatcher/app');
let ContactConstants = require('../constants/contact-constants.js');
let BaseStore = require('./base-store');

var ContactStore = assign({}, BaseStore, {
  _modalOpen: false,

  isModalOpen() {
    return this._modalOpen;
  }
});

AppDispatcher.register(function(payload) {
  switch(payload.actionType) {
      case ContactConstants.OPEN_CONTACT_MODAL:
        ContactStore._modalOpen = true
        ContactStore.emitChange();
        break;
      case ContactConstants.CLOSE_CONTACT_MODAL:
        ContactStore._modalOpen = false;
        ContactStore.emitChange();
        break;
      default:
        break;
    };
});

module.exports = ContactStore;