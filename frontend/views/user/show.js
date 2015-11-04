let React = require('react');
let AuthenticatedComponent = require('../auth/authenticated');

module.exports = AuthenticatedComponent(class UserShow extends React.Component {
  render() {
    
    return (
      <h1>Hello {this.props.user.firstName}</h1>
    );
  }
});