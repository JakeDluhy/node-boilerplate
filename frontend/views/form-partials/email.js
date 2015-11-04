var React = require('react/addons');
var classNames = require('classnames');
var LoginActions = require('../../actions/login-actions');
var LoginStore = require('../../stores/login-store');

var EmailField = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      value: this.props.valueLink.value
    }
  },

  _linkValues(ev) {
    this.setState({value: ev.target.value});
    this.props.valueLink.requestChange(ev.target.value);
    this._validateCleanEmail();
  },

  _validateEmail(ev) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var val = this.state.value;
    if(!re.test(val)) {
      LoginActions.formErrors({emailError: 'Invalid email address'});
    } else {
      LoginActions.formErrors({emailError: ''});
    }
  },

  _validateCleanEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var val = this.state.value;
    if(re.test(val)) {
      LoginActions.formErrors({emailError: ''});
    }
  },

  render() {
    var inputError = !(this.props.errorMessage === undefined || this.props.errorMessage === '');
    var inputClasses = classNames('mui-form-control', {'input-errors': inputError});
    return (
      <div className="mui-form-group">
        <div className="form-errors">{this.props.errorMessage}</div>
        <input type="email" className={inputClasses} onChange={this._linkValues} onBlur={this._validateEmail} placeholder="Email"/>
      </div>
    )
  }
});

module.exports = EmailField;