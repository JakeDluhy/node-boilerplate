let React = require('react/addons');
let Auth = require('../../services/auth');
let LoginActions = require('../../actions/login-actions');
let LoginStore = require('../../stores/login-store');
let classNames = require('classnames');

let EmailField = require('../form-partials/email');

module.exports = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      email: '',
      emailError: ''
    };
  },

  componentDidMount() {
    LoginStore.addChangeListener(this._onLoginChange);
  },

  componentWillUnmount() {
    LoginStore.removeChangeListener(this._onLoginChange);
  },

  recoverPassword(ev) {
    ev.preventDefault();
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(!re.test(this.state.email)) {
      LoginActions.formErrors({emailError: 'Invalid email address'});
      return;
    }
    Auth.recoverPassword(this.state.email);
  },

  render() {
    var disabled = this.state.emailError !== '';
    var submitClasses = classNames('mui-btn', 'mui-btn-primary', 'mui-btn-raised', 'form-submit', {'disabled': disabled});
    return (
      <div className="settings-wrapper centered fixed-width">
        <h1>Forgot your password?</h1>
        <p>
          No worries! Enter your email address below and we'll send you a temporary one. Just make sure to check your spam folder for our email.
        </p>
        <form role="form" className="auth-form">
          <EmailField valueLink={this.linkState('email')} errorMessage={this.state.emailError} />
          <a className={submitClasses} onClick={this.recoverPassword}>Submit</a>
        </form>
      </div>

    );
  },

  _onLoginChange() {
    this.setState(LoginStore.getFormErrors());
  }
});