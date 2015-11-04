let React = require('react');
let LoginStore = require('../../stores/login-store');
let reactMixin = require('react-mixin');
let Navigation = require('react-router').Navigation;

module.exports = (ComposedComponent) => {
  var AuthenticatedComponent = React.createClass({
    statics: {
      onEnter(next, transition) {
        if (!LoginStore.isLoggedIn()) {
          transition('/');
        }
      }
    },
    

    getInitialState() {
      return this._getLoginState();
    },

    _getLoginState() {
      return {
        userLoggedIn: LoginStore.isLoggedIn(),
        user: LoginStore.getUser(),
        jwt: LoginStore.getJwt()
      };
    },

    componentDidMount() {
      this.changeListener = this._onChange.bind(this);
      LoginStore.addChangeListener(this.changeListener);
    },

    _onChange() {
      this.setState(this._getLoginState());
    },

    componentWillUnmount() {
      LoginStore.removeChangeListener(this.changeListener);
    },

    render() {
      return (
      <ComposedComponent
        {...this.props}
        user={this.state.user}
        jwt={this.state.jwt}
        userLoggedIn={this.state.userLoggedIn} />
      );
    }
  });
  return AuthenticatedComponent;
};