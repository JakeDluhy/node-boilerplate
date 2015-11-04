var PATH_TO_ROOT = '../../../..';

var expect = require('chai').expect;
var sinon = require('sinon');

var jsdom = require('mocha-jsdom');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Password Form Partial Component', function() {
  jsdom();

  it('links the input to the value link', function() {
    var PasswordComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/password');

    var passwordInput = 'foo.bar@test.com';
    var valueLinkMock = {
      value: '',
      requestChange: function(value) {
        expect(value).to.equal(passwordInput)
      }
    }
    var passwordField = TestUtils.renderIntoDocument(<PasswordComponent valueLink={valueLinkMock} />);
    var input = TestUtils.findRenderedDOMComponentWithTag(passwordField, 'input');
    TestUtils.Simulate.change(input, { target: { value: passwordInput } });
  });

  it('renders the errors from props into the form', function() {
    var PasswordComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/password');

    var errorMessage = "Password error";
    var valueLinkMock = { value: '' };
    var passwordField = TestUtils.renderIntoDocument(<PasswordComponent valueLink={valueLinkMock} errorMessage={errorMessage} />);
    var errorDiv = TestUtils.findRenderedDOMComponentWithClass(passwordField, 'form-errors');

    expect(errorDiv.getDOMNode().textContent).to.equal(errorMessage);
  });

  it('validates the email and renders and error if invalid', function() {
    var PasswordComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/password');
    var LoginActions = require(PATH_TO_ROOT+'/frontend/actions/login-actions');

    var passwordInput = 'sdsdf';
    var valueLinkMock = {
      value: '',
      requestChange: function() {}
    };
    var passwordField = TestUtils.renderIntoDocument(<PasswordComponent valueLink={valueLinkMock} />);
    var input = TestUtils.findRenderedDOMComponentWithTag(passwordField, 'input');

    var mock = sinon.mock(LoginActions).expects('formErrors').withExactArgs({passwordError: 'Password too short'});

    TestUtils.Simulate.change(input, { target: { value: passwordInput } });
    TestUtils.Simulate.blur(input);
  });
});