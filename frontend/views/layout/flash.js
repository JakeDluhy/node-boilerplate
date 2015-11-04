let React = require('react');
let FlashStore = require('../../stores/flash-store');
let classNames = require('classnames');
let FlashActions = require('../../actions/flash-actions');

var Flash = React.createClass({
  getInitialState() {
    return {
      visible: FlashStore.isVisible(),
      type: FlashStore.getType(),
      message: FlashStore.getMessage()
    };
  },

  componentDidMount() {
    FlashStore.addChangeListener(this._onFlashChange);
  },

  componentWillMount() {
    FlashStore.removeChangeListener(this._onFlashChange);
  },

  closeFlash() {
    FlashActions.closeFlash();
  },

  render() {
    var classes = classNames('flash-message', {visible: this.state.visible}, this.state.type);
    return (
      <div className="flash-wrapper">
        <div className={classes}>
          <h4 className="message">{this.state.message}</h4>
          <div className="close-flash" onClick={this.closeFlash}><i className="mdi mdi-close"></i></div>
        </div>
      </div>
    )
  },

  _onFlashChange() {
    this.setState({
      visible: FlashStore.isVisible(),
      type: FlashStore.getType(),
      message: FlashStore.getMessage()
    })
  }
});

module.exports = Flash;