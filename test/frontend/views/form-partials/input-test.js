var PATH_TO_ROOT = '../../../..';

var expect = require('chai').expect;
var sinon = require('sinon');

var jsdom = require('mocha-jsdom');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

describe('Input Form Partial Component', function() {
  jsdom();

  it('links the input to the value link', function() {
    var InputComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/input');

    var inputValue = 'Foo';
    var valueLinkMock = {
      value: '',
      requestChange: function(value) {
        expect(value).to.equal(inputValue)
      }
    }
    var inputField = TestUtils.renderIntoDocument(<InputComponent valueLink={valueLinkMock} />);
    var input = TestUtils.findRenderedDOMComponentWithTag(inputField, 'input');
    TestUtils.Simulate.change(input, { target: { value: inputValue } });
  });

  it('renders the errors from props into the form', function() {
    var InputComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/input');

    var errorMessage = "Input error";
    var valueLinkMock = { value: '' };
    var inputField = TestUtils.renderIntoDocument(<InputComponent valueLink={valueLinkMock} errorMessage={errorMessage} />);
    var errorDiv = TestUtils.findRenderedDOMComponentWithClass(inputField, 'form-errors');

    expect(errorDiv.getDOMNode().textContent).to.equal(errorMessage);
  });

  // it('validates the email and renders and error if invalid', function() {
  //   var InputComponent = require(PATH_TO_ROOT+'/frontend/views/form-partials/input');
  //   var LoginActions = require(PATH_TO_ROOT+'/frontend/actions/login-actions');

  //   var inputValue = 'sddfasdf';
  //   var valueLinkMock = {
  //     value: '',
  //     requestChange: function() {}
  //   };
  //   var inputField = TestUtils.renderIntoDocument(<InputComponent valueLink={valueLinkMock} />);
  //   var input = TestUtils.findRenderedDOMComponentWithTag(inputField, 'input');

  //   var mock = sinon.mock(LoginActions).expects('formErrors').withExactArgs({emailError: 'Invalid email address'});

  //   TestUtils.Simulate.change(input, { target: { value: inputValue } });
  //   TestUtils.Simulate.blur(input);
  // });
});