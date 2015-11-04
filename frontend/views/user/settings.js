let React = require('react/addons');
let Auth = require('../../services/auth');
let AuthenticatedComponent = require('../auth/authenticated');
let FlashActions = require('../../actions/flash-actions');

module.exports = AuthenticatedComponent(React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    var user = this.props.user;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mailingList: user.mailingList,
      oldPassword: '',
      newPassword: '',
      newPasswordConfirmation: ''
    };
  },

  submitEdits(ev) {
    ev.preventDefault();
    Auth.updateProfile({
      id: this.state.id,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      mailingList: this.state.mailingList
    })
  },
  changePassword(ev) {
    ev.preventDefault();
    if(this.state.newPassword === this.state.newPasswordConfirmation) {
      Auth.changePassword({
        id: this.state.id,
        oldPassword: this.state.oldPassword,
        newPassword: this.state.newPassword
      })
    } else {
      FlashActions.newFlash('error', "Passwords don't match!");
    }
  },

  render() {
    return (
      <div className="settings-wrapper centered fixed-width">
        <h1>Settings</h1>
        <form role="form" className="auth-form">
          <div className="mui-form-group">
            <input type="text" className="mui-form-control" valueLink={this.linkState('firstName')} placeholder="First Name"/>
          </div>
          <div className="mui-form-group">
            <input type="text" className="mui-form-control" valueLink={this.linkState('lastName')} placeholder="Last Name"/>
          </div>
          <div className="mui-form-group">
            <input type="email" className="mui-form-control" valueLink={this.linkState('email')} placeholder="Email"/>
          </div>
          <div className="mui-checkbox mailing-list-checkbox">
            <label>
              <input type="checkbox" checked={this.state.mailingList} onChange={this._mailingListChange} /> Sign up for mailing list
            </label>
          </div>
          <a className="mui-btn mui-btn-primary mui-btn-raised form-submit" onClick={this.submitEdits}>Submit</a>
        </form>
        <h1>Change Password</h1>
        <form role="form" className="auth-form">
          <div className="mui-form-group">
            <input type="password" className="mui-form-control" valueLink={this.linkState('oldPassword')} placeholder="Old Password"/>
          </div>
          <div className="mui-form-group">
            <input type="password" className="mui-form-control" valueLink={this.linkState('newPassword')} placeholder="New Password"/>
          </div>
          <div className="mui-form-group">
            <input type="password" className="mui-form-control" valueLink={this.linkState('newPasswordConfirmation')} placeholder="Confirm Password"/>
          </div>
          <a className="mui-btn mui-btn-primary mui-btn-raised form-submit" onClick={this.changePassword}>Change Password</a>
        </form>
      </div>

    );
  },

  _mailingListChange() {
    this.setState({mailingList: !this.state.mailingList});
  }
}));