let React = require('react');

let Header = require('./layout/header');
let Footer = require('./layout/footer');

var ApplicationWrapper = React.createClass({
  render() {
    return (
      <div id="application-wrapper" className="application-wrapper">
        <Header />
        <div className="body-wrapper">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = ApplicationWrapper;