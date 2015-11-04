let React = require('react/addons');
let Modal = require('react-modal');
let Auth = require('../../services/auth');
let ContactForm = require('../modals/contact');
let ContactActions = require('../../actions/contact-actions');
let ContactStore = require('../../stores/contact-store');

var Index = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return  {
      email: '',
      feedbackModalIsOpen: ContactStore.isModalOpen()
    }
  },

  componentDidMount() {
    ContactStore.addChangeListener(this._onContactChange);
  },

  componentWillUnmount() {
    ContactStore.removeChangeListener(this._onContactChange);
  },

  inputEmailList(ev) {
    if(ev.charCode === 13) {
      this.signupForEmailList();
    }
  },
  signupForEmailList() {
    Auth.registerForMailingList(this.state.email);
  },

  openContactModal() {
    ContactActions.openContactModal();
  },

  closeContactModal() {
    ContactActions.closeContactModal();
  },

  render() {
    return (
      <div className="index-wrapper">
        <div className="welcome-banner">
          <div className="opacity-shield">
            <div className="welcome-container">
              <h1>Welcome to My Company</h1>
              <h3>The coolest app ever</h3>
              <a to="/armies/create" className="mui-btn mui-btn-primary mui-btn-raised">Get started!</a>
            </div>
          </div>
        </div>
        <div className="icons-banner">
          <div className="mui-row">
            <div className="mui-col-xs-12 mui-col-md-4 icon-wrapper">
              <div className="icon-container">
                <i className="mdi mdi-file-document"></i>
              </div>
              <div className="icon-description">
                <h3 className="description">Pick a ruleset</h3>
              </div>
            </div>
            <div className="mui-col-xs-12 mui-col-md-4 icon-wrapper">
              <div className="icon-container">
                <i className="mdi mdi-account-multiple"></i>
              </div>
              <div className="icon-description">
                <h3 className="description">Build your army</h3>
              </div>
            </div>
            <div className="mui-col-xs-12 mui-col-md-4 icon-wrapper">
              <div className="icon-container">
                <i className="mdi mdi-sword"></i>
              </div>
              <div className="icon-description">
                <h3 className="description">Crush your opponents</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="about-banner">
          <div className="seventy-text-wrapper">
            <h3 className="frontpage-text white-text">
              My Company does stuff
            </h3>
          </div>
          <div className="build-wrapper">
            <a to="/armies/create" className="mui-btn mui-btn-obvious mui-btn-raised">Try it out</a>
          </div>
        </div>
        <div className="email-signup-banner">
          <div className="mailinglist-wrapper">
            <div className="mailinglist-prompt">
              <h3 className="frontpage-text dark-text">Want to stay in the loop? Sign up to get updates!</h3>
            </div>
            <div className="mailinglist-container">
              <div className="mui-form-group">
                <input type="email" valueLink={this.linkState('email')} placeholder="Email" className="mui-form-control text-form" onKeyPress={this.inputEmailList} />
              </div>
              <div className="btn-container">
                <a className="mui-btn mui-btn-primary mui-btn-raised" onClick={this.signupForEmailList}>Sign me up</a>
              </div>
            </div>
            <div className="contact-us-prompt">
              <h3 className="frontpage-text dark-text">Feature request? Story to tell? Feel like chatting?</h3>
            </div>
            <div className="contact-us-container">
              <div className="btn-container">
                <a className="mui-btn mui-btn-primary mui-btn-raised" onClick={this.openContactModal}>Contact us</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-banner">
          <div className="seventy-text-wrapper">
            <div className="copyright-container">
              Copyright &copy; My Company, 2015
            </div>
          </div>
        </div>
        <Modal isOpen={this.state.feedbackModalIsOpen} onRequestClose={this.closeContactModal}>
          <ContactForm />
        </Modal>
      </div>
    )
  },

  _onContactChange() {
    this.setState({feedbackModalIsOpen: ContactStore.isModalOpen()});
  }
});

module.exports = Index;