var assign = require('object-assign');

let AppDispatcher = require('../dispatcher/app');
let FlashConstants = require('../constants/flash-constants.js');
let BaseStore = require('./base-store');

var FlashStore = assign({}, BaseStore, {
  _visible: false,
  _type: 'success',
  _message: '',

  isVisible() {
    return this._visible;
  },

  getType() {
    return this._type;
  },

  getMessage() {
    return this._message;
  },

  setTimeout() {
    setTimeout(function() {
      this._visible = false;
      this.emitChange();
    }.bind(this), 3000);
  }
});

AppDispatcher.register(function(payload) {
  switch(payload.actionType) {
      case FlashConstants.NEW_FLASH_MESSAGE:
        FlashStore._visible = true;
        FlashStore._type = payload.type;
        FlashStore._message = payload.message;
        FlashStore.emitChange();
        FlashStore.setTimeout();
        break;
      case FlashConstants.CLOSE_FLASH_MESSAGE:
        FlashStore._visible = false;
        FlashStore.emitChange();
        break;
      default:
        break;
    };
});

module.exports = FlashStore;