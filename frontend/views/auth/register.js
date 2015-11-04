let React = require('react/addons');
let Auth = require('../../services/auth');
let LoginActions = require('../../actions/login-actions');
let classNames = require('classnames');

let EmailField = require('../form-partials/email');
let PasswordField = require('../form-partials/password');
let InputField = require('../form-partials/input');

let LoginStore = require('../../stores/login-store');

let Register = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return  {
      firstName: '',
      lastName: '',
      email: '',
      emailError: '',
      password: '',
      passwordError: '',
      mailingList: true
    }
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

  register(ev) {
    ev.preventDefault();
    Auth.register(this.state)
        .catch(function(err) {
          console.log('Error registering', err);
        });
  },

  goToLogin() {
    LoginActions.registering(false);
  },

  render() {
    var disabled = !(this.state.emailError === '' && this.state.passwordError === '');
    var submitClasses = classNames('mui-btn', 'mui-btn-primary', 'mui-btn-raised', 'form-submit', {'disabled': disabled});
    return (
      <div className="register-form">
        <div className="modal-header">
          <h2 className="header-text">Register</h2>
          <a className="header-button header-text" onClick={this.goToLogin}>
            or, login
          </a>
        </div>
        <div className="modal-body">
          <form role="form" className="auth-form">
            <InputField valueLink={this.linkState('firstName')} placeholder="First Name" required="false" />
            <InputField valueLink={this.linkState('lastName')} placeholder="Last Name" required="false" />
            <EmailField valueLink={this.linkState('email')} errorMessage={this.state.emailError} />
            <PasswordField valueLink={this.linkState('password')} errorMessage={this.state.passwordError} />
            <div className="mui-checkbox mailing-list-checkbox">
              <label>
                <input type="checkbox" checked={this.state.mailingList} onChange={this._mailingListChange} /> Sign up for mailing list
              </label>
            </div>
            <a className={submitClasses} onClick={this.register}>Submit</a>
          </form>
        </div>
      </div>
    )
  },

  _mailingListChange() {
    this.setState({mailingList: !this.state.mailingList});
  },

  _onLoginChange() {
    this.setState(LoginStore.getFormErrors());
  }
});

module.exports = Register;