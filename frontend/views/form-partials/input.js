let React = require('react/addons');
let classNames = require('classnames');

let InputField = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      value: this.props.valueLink.value,
      placeholder: this.props.placeholder,
      errorMessage: this.props.errorMessage,
      required: this.props.required
    }
  },

  _linkValues(ev) {
    this.setState({value: ev.target.value});
    this.props.valueLink.requestChange(ev.target.value);
  },

  _validateInput(ev) {
    var val = this.state.value;
    if(this.state.required === "true" && this.state.value.trim() === '') {
      this.setState({errorMessage: 'Required field'});
      if(this.props.setInputError) this.props.setInputError('Required field');
    } else {
      this.setState({errorMessage: ''});
      if(this.props.setInputError) this.props.setInputError('');
    }
  },

  render() {
    var inputError = !(this.state.errorMessage === undefined || this.state.errorMessage === '');
    var inputClasses = classNames('mui-form-control', {'input-errors': inputError});
    return (
      <div className="mui-form-group">
        <div className="form-errors">{this.state.errorMessage}</div>
        <input type="text" className={inputClasses} onChange={this._linkValues} onBlur={this._validateInput} placeholder={this.state.placeholder}/>
      </div>
    )
  }
});

module.exports = InputField;