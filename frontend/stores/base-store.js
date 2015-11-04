var assign = require('object-assign');

let EventEmitter = require('events').EventEmitter;
let AppDispatcher = require('../dispatcher/app');

var BaseStore = assign({}, EventEmitter.prototype, {
  subscribe(actionSubscribe) {
    this._dispatchToken = AppDispatcher.register(actionSubscribe());
  },

  getDispatchToken() {
    return this._dispatchToken;
  },

  emitChange() {
    this.emit('CHANGE');
  },

  addChangeListener(cb) {
    this.on('CHANGE', cb)
  },

  removeChangeListener(cb) {
    this.removeListener('CHANGE', cb);
  }
});

module.exports = BaseStore;