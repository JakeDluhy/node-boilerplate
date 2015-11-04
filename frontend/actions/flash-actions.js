let AppDispatcher = require('../dispatcher/app');
let FlashConstants = require('../constants/flash-constants');

module.exports = {
  newFlash(type, message) {
    AppDispatcher.dispatch({
      actionType: FlashConstants.NEW_FLASH_MESSAGE,
      type: type,
      message: message
    });
  },

  closeFlash() {
    AppDispatcher.dispatch({
      actionType: FlashConstants.CLOSE_FLASH_MESSAGE
    });
  }
}