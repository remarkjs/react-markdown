// auto-generated from index.js via build.js, do not edit directly
(function() {
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  CodeMirrorEditor = (function (require, module) {
    'use strict';

    var React = require('react');
    var CodeMirror;

    // adapted from:
    // https://github.com/facebook/react/blob/master/docs/_js/live_editor.js#L16

    // also used as an example:
    // https://github.com/facebook/react/blob/master/src/browser/ui/dom/components/ReactDOMInput.js

    var IS_MOBILE = typeof navigator === 'undefined' || (
      navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    );

    if (!IS_MOBILE) {
      CodeMirror = require('codemirror');
    }

    var CodeMirrorEditor = function (_React$Component) {
      _inherits(CodeMirrorEditor, _React$Component);

      function CodeMirrorEditor(props) {
        _classCallCheck(this, CodeMirrorEditor);

        var _this = _possibleConstructorReturn(this, (CodeMirrorEditor.__proto__ || Object.getPrototypeOf(CodeMirrorEditor)).call(this, props));

        _this.handleChange = function () {
          if (_this.editor) {
            var value = _this.editor.getValue();
            if (value !== _this.props.value) {
              _this.props.onChange && _this.props.onChange({ target: { value: value } });
              if (_this.editor.getValue() !== _this.props.value) {
                if (_this.state.isControlled) {
                  _this.editor.setValue(_this.props.value);
                } else {
                  _this.props.value = value;
                }
              }
            }
          }
        };

        _this.state = { isControlled: props.value != null };
        return _this;
      }

      _createClass(CodeMirrorEditor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          var isTextArea = this.props.forceTextArea || IS_MOBILE;
          if (!isTextArea) {
            this.editor = CodeMirror.fromTextArea(this.refs.editor, this.props);
            this.editor.on('change', this.handleChange);
          }
        }
      }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
          if (this.editor) {
            if (this.props.value != null) {
              if (this.editor.getValue() !== this.props.value) {
                this.editor.setValue(this.props.value);
              }
            }
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return React.createElement(
            'div',
            { style: this.props.style, className: this.props.className },
            React.createElement('textarea', {
              ref: 'editor',
              value: this.props.value,
              readOnly: this.props.readOnly,
              defaultValue: this.props.defaultValue,
              onChange: this.props.onChange,
              style: this.props.textAreaStyle,
              className: this.props.textAreaClassName || this.props.textAreaClass
            })
          );
        }
      }]);

      return CodeMirrorEditor;
    }(React.Component);

    module.exports = CodeMirrorEditor;

    return module.exports;
    }(function (id) {
    if (id === "react") return React;
    else if (id === "codemirror") return CodeMirror;
    else throw new Error("Unexpected require of " + id);
    }, {exports: {}}));
})();
