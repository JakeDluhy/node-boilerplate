let React = require('react/addons');
let Select = require('react-select-box');
let ContactService = require('../../services/contact');
let ContactActions = require('../../actions/contact-actions')

let Contact = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return  {
      contactType: 'Reaching Out', //TODO pass params in
      name: '',
      email: '',
      content: ''
    }
  },

  selectChange(ev) {
    this.setState({contactType: ev.target.value});
  },

  sendForm() {
    ContactService.submitContactForm(this.state);
    ContactActions.closeContactModal();
  },

  render() {
    return (
      <div className="contact-form">
        <div className="modal-header">
          <h2 className="header-text">Contact</h2>
        </div>
        <div className="modal-body">
          <form role="form">
            <div className="form-group">
              <div className="mui-select">
                <select value={this.state.contactType} onChange={this.selectChange}>
                  <option value="Reaching Out">Reaching Out</option>
                  <option value="Bug Feedback">Bug Feedback</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>
              <div className="mui-form-group">
                <input type="text" className="mui-form-control" valueLink={this.linkState('name')} placeholder="Name"/>
              </div>
              <div className="mui-form-group">
                <input type="email" className="mui-form-control" valueLink={this.linkState('email')} placeholder="Email"/>
              </div>
              <div className="mui-form-group">
                <textarea className="mui-form-control" valueLink={this.linkState('content')} placeholder="Comment"/>
              </div>
            </div>
            <a className="mui-btn mui-btn-primary mui-btn-raised form-submit" onClick={this.sendForm}>Submit</a>
          </form>
        </div>
      </div>
    )
  }
});

module.exports = Contact;