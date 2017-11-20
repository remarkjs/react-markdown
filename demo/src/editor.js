const React = require('react')
const CodeMirror = window.CodeMirrorEditor
const PropTypes = require('prop-types')

function Editor(props) {
  return (
    <form className="editor pure-form">
      <CodeMirror mode="markdown" theme="monokai" value={props.value} onChange={props.onChange} />
    </form>
  )
}

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string
}

Editor.defaultProps = {
  value: ''
}

module.exports = Editor
