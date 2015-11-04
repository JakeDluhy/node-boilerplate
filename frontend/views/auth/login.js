let React = require('react/addons');
let Link = require('react-router').Link;
let Auth = require('../../services/auth');
let LoginActions = require('../../actions/login-actions');
let LoginStore = require('../../stores/login-store');
let classNames = require('classnames');

let EmailField = require('../form-partials/email');
let PasswordField = require('../form-partials/password');

let Login = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    var state = {
      email: '',
      emailError: '',
      password: '',
      passwordError: '',
      rememberMe: true
    };
    return state;
  },

  componentDidMount() {
    LoginStore.addChangeListener(this._onLoginChange);
  },

  componentWillUnmount() {
    LoginStore.removeChangeListener(this._onLoginChange);
  },

  setEmailError(val) {
    this.setState({emailError: val});
  },

  setPasswordError(val) {
    this.setState({passwordError: val});
  },

  login(ev) {
    ev.preventDefault();
    if(this.state.password.length < 8) {
      this.setState({passwordError: 'Password too short'});
      return;
    }
    Auth.login(this.state.email, this.state.password, this.state.rememberMe)
    .catch(function(err) {
      console.log('Error logging in', err);
    });
  },

  goToRegister() {
    LoginActions.registering(true);
  },

  render() {
    var disabled = !(this.state.emailError === '' && this.state.passwordError === '');
    var submitClasses = classNames('mui-btn', 'mui-btn-primary', 'mui-btn-raised', 'form-submit', {'disabled': disabled});
    return (
      <div className="login-form">
        <div className="modal-header">
          <h2 className="header-text">Log In</h2>
          <a className="header-button header-text" onClick={this.goToRegister}>
            or, signup
          </a>
        </div>
        <div className="modal-body">
          <form role="form" className="auth-form">
            <EmailField valueLink={this.linkState('email')} errorMessage={this.state.emailError} />
            <PasswordField valueLink={this.linkState('password')} errorMessage={this.state.passwordError} />
            <div className="mui-checkbox mailing-list-checkbox">
              <label>
                <input type="checkbox" checked={this.state.rememberMe} onChange={this._rememberMeChange} /> Remember me
              </label>
              <a href="/forgot" className="forgot-password">Forgot your password?</a>
            </div>
            <a className={submitClasses} onClick={this.login}>Submit</a>
          </form>
        </div>
      </div>
    )
  },

  _rememberMeChange() {
    this.setState({rememberMe: !this.state.rememberMe});
  },

  _onLoginChange() {
    this.setState(LoginStore.getFormErrors());
  }
});

module.exports = Login;