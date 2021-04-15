import React from 'react'
import PropTypes from 'prop-types'

const CodeMirror = window.CodeMirror

// Adapted from:
// https://github.com/facebook/react/blob/master/docs/_js/live_editor.js#L16

// also used as an example:
// https://github.com/facebook/react/blob/master/src/browser/ui/dom/components/ReactDOMInput.js

const mobile =
  typeof navigator === 'undefined' ||
  navigator.userAgent.match(/android/i) ||
  navigator.userAgent.match(/webos/i) ||
  navigator.userAgent.match(/iphone/i) ||
  navigator.userAgent.match(/ipad/i) ||
  navigator.userAgent.match(/ipod/i) ||
  navigator.userAgent.match(/blackberry/i) ||
  navigator.userAgent.match(/windows phone/i)

export class CodeMirrorEditor extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.editorRef = React.createRef()
  }

  componentDidMount() {
    if (!mobile) {
      this.editor = CodeMirror.fromTextArea(this.editorRef.current, this.props)
      this.editor.on('change', this.handleChange)
    }
  }

  componentDidUpdate() {
    if (!this.editor) return

    if (this.props.value && this.editor.getValue() !== this.props.value) {
      this.editor.setValue(this.props.value)
    }
  }

  handleChange() {
    if (!this.editor) return

    const value = this.editor.getValue()

    if (value === this.props.value) return

    if (this.props.onChange) {
      this.props.onChange({target: {value}})
    }

    if (this.editor.getValue() !== this.props.value) {
      this.editor.setValue(this.props.value)
    }
  }

  render() {
    return (
      <textarea
        ref={this.editorRef}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    )
  }
}

CodeMirrorEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
}
