var PATH_TO_ROOT = '../../../..';

var expect = require('chai').expect;
var sinon = require('sinon');

var jsdom = require('mocha-jsdom');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Email Form Partial Component', function() {
  jsdom();

  it('links the input to the value link', function() {
    var EmailComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/email');

    var emailInput = 'foo.bar@test.com';
    var valueLinkMock = {
      value: '',
      requestChange: function(value) {
        expect(value).to.equal(emailInput)
      }
    }
    var emailField = TestUtils.renderIntoDocument(<EmailComponent valueLink={valueLinkMock} />);
    var input = TestUtils.findRenderedDOMComponentWithTag(emailField, 'input');
    TestUtils.Simulate.change(input, { target: { value: emailInput } });
  });

  it('renders the errors from props into the form', function() {
    var EmailComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/email');

    var errorMessage = "Email error";
    var valueLinkMock = { value: '' };
    var emailField = TestUtils.renderIntoDocument(<EmailComponent valueLink={valueLinkMock} errorMessage={errorMessage} />);
    var errorDiv = TestUtils.findRenderedDOMComponentWithClass(emailField, 'form-errors');

    expect(errorDiv.getDOMNode().textContent).to.equal(errorMessage);
  });

  it('validates the email and renders and error if invalid', function() {
    var EmailComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/email');
    var LoginActions = require(PATH_TO_ROOT+'/frontend/actions/login-actions');

    var emailInput = 'sddfasdf';
    var valueLinkMock = {
      value: '',
      requestChange: function() {}
    };
    var emailField = TestUtils.renderIntoDocument(<EmailComponent valueLink={valueLinkMock} />);
    var input = TestUtils.findRenderedDOMComponentWithTag(emailField, 'input');

    var mock = sinon.mock(LoginActions).expects('formErrors').withExactArgs({emailError: 'Invalid email address'});

    TestUtils.Simulate.change(input, { target: { value: emailInput } });
    TestUtils.Simulate.blur(input);
  });
});