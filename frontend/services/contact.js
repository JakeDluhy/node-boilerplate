var request = require('reqwest');
let FlashActions = require('../actions/flash-actions');
let ContactActions = require('../actions/contact-actions');

var contactService = {
  submitContactForm(params) {
    return request({
      url: '/api/contact',
      method: 'POST',
      type: 'json',
      data: {
        contact: params
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

module.exports = contactService;