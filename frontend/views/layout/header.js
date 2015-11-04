let React = require('react');
let Router = require('react-router');
let Link = Router.Link;
let Navigation = Router.Navigation;
let Modal = require('react-modal');
let Login = require('../auth/login');
let Register = require('../auth/register');
let Flash = require('./flash');

let LoginStore = require('../../stores/login-store');
let LoginActions = require('../../actions/login-actions');
let FlashActions = require('../../actions/flash-actions');

Modal.setAppElement(document.body);
Modal.injectCSS();

var Header = React.createClass({
  mixins: [Navigation],

  getInitialState() {
    return {
      loginModalIsOpen: LoginStore.isModalOpen(),
      loggedIn: LoginStore.isLoggedIn(),
      isRegistering: LoginStore.isRegistering()
    };
  },

  componentDidMount() {
    LoginStore.addChangeListener(this._onLoginChange);
  },

  componentWillUnmount() {
    LoginStore.removeChangeListener(this._onLoginChange);
  },

  openLoginModal() {
    LoginActions.openLoginModal();
  },

  closeLoginModal() {
    LoginActions.closeLoginModal();
  },

  logOut() {
    LoginActions.logoutUser();
    FlashActions.newFlash('success', 'Goodbye, come back soon!');
  },

  goToHome() {
    this.transitionTo('root');
  },

  goToOption1() {
    console.log('Transition to option 1');
  },

  goToOption2() {
    console.log('Transition to option 2');
  },

  goToAccount() {
    if(this.state.loggedIn) {
      this.transitionTo('/users/settings');
    } else {
      this.openLoginModal();
    }
  },


  render() {
    if(this.state.loggedIn) {
      var profileButton = <ProfileButton/>;
      var option2Button = <Option2Button/>;
      var option1Button = <Option1Button/>;
    } else {
      var profileButton = <LoginButton/>;
      var option2Button = <EmptyButton/>;
      var option1Button = <EmptyButton/>;
    }
    if(this.state.isRegistering) {
      var modalContent = <Register />;
    } else {
      var modalContent = <Login />
    }
    return (
      <div className="header-wrapper">
        <div className="mui-appbar">
          <div className="appname-container">
            <h1 className="header-text">
              <Link to="/" className="logo">My Company</Link>
            </h1>
          </div>
          <div className="navigation-container">
            <h3 onClick={(this.state.loggedIn ? this.logOut : this.openLoginModal)}>
              {(this.state.loggedIn ? 'Logout':'Login')}
            </h3>
          </div>
          <div className="icon-mobile-nav">
            <table>
              <tr>
                <td className="active-button" onClick={this.goToHome}>
                  <HomeButton/>
                </td>
                <td className={this.state.loggedIn ? 'active-button' : ''} onClick={this.goToOption1}>
                  {option1Button}
                </td>
                <td className={this.state.loggedIn ? 'active-button' : ''} onClick={this.goToOption2}>
                  {option2Button}
                </td>
                <td className="active-button" onClick={this.goToSettings}>
                  {profileButton}
                </td>
              </tr>
            </table>
          </div>
          <Modal isOpen={this.state.loginModalIsOpen} onRequestClose={this.closeLoginModal}>
            {modalContent}
          </Modal>
        </div>
        <Flash />
      </div>
    )
  },

  _onLoginChange() {
    this.setState({
      loggedIn: LoginStore.isLoggedIn(),
      loginModalIsOpen: LoginStore.isModalOpen(),
      isRegistering: LoginStore.isRegistering()
    });
  }
});

var HomeButton = React.createClass({
  render() {
    return (
      <div>
        <i className="mdi mdi-home"></i>
        <div>Home</div>
      </div>
    )
  }
})

var LoginButton = React.createClass({
  render() {
    return (
      <div>
        <i className="mdi mdi-login"></i>
        <div>Login</div>
      </div>
    )
  }
});

var ProfileButton = React.createClass({
  render() {
    return (
      <div>
        <i className="mdi mdi-account"></i>
        <div>Account</div>
      </div>
    )
  }
});

var Option1Button = React.createClass({
  render() {
    return (
      <div>
        <i className="mdi mdi-sword"></i>
        <div>Fight</div>
      </div>
    )
  }
});

var Option2Button = React.createClass({
  render() {
    return (
      <div>
        <i className="mdi mdi-gavel"></i>
        <div>Build</div>
      </div>
    )
  }
});

var EmptyButton = React.createClass({
  render() {
    return (
      <div></div>
    )
  }
});

module.exports = Header;