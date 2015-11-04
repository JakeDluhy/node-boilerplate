let React = require('react/addons');
let classNames = require('classnames');
let LoginActions = require('../../actions/login-actions');
let LoginStore = require('../../stores/login-store');

let PasswordField = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      value: this.props.valueLink.value
    }
  },

  _linkValues(ev) {
    this.setState({value: ev.target.value});
    this.props.valueLink.requestChange(ev.target.value);
    this._validateCleanPassword();
  },

  _validatePassword(ev) {
    var val = this.state.value;
    if(val.length < 8) {
      LoginActions.formErrors({passwordError: 'Password too short'});
    } else {
      LoginActions.formErrors({passwordError: ''});
    }
  },

  _validateCleanPassword() {
    if(this.state.value.length >= 8) {
      LoginActions.formErrors({passwordError: ''});
    }
  },

  render() {
    var inputError = !(this.props.errorMessage === undefined || this.props.errorMessage === '');
    var inputClasses = classNames('mui-form-control', {'input-errors': inputError});
    return (
      <div className="mui-form-group">
        <div className="form-errors">{this.props.errorMessage}</div>
        <input type="password" className={inputClasses} onChange={this._linkValues} onBlur={this._validatePassword} placeholder="Password"/>
      </div>
    )
  }
});

module.exports = PasswordField;