const React = require('react')
const PropTypes = require('prop-types')

class MarkdownControls extends React.PureComponent {
  constructor() {
    super()

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    this.props.onChange(evt.target.value)
  }

  render() {
    const rawChecked = this.props.mode === 'raw'
    const skipChecked = this.props.mode === 'skip'
    const escapeChecked = this.props.mode === 'escape'

    return (
      <div className="markdown-controls">
        <form className="pure-form pure-form-inline">
          <fieldset>
            <legend>HTML mode:</legend>

            <label htmlFor="raw-html" className="pure-checkbox">
              Raw&nbsp;
              <input
                id="raw-html"
                name="html-mode"
                type="radio"
                value="raw"
                checked={rawChecked}
                onChange={this.handleChange}
              />
            </label>

            <label htmlFor="escape-html" className="pure-checkbox">
              Escape&nbsp;
              <input
                id="escape-html"
                name="html-mode"
                type="radio"
                value="escape"
                checked={escapeChecked}
                onChange={this.handleChange}
              />
            </label>

            <label htmlFor="skip-html" className="pure-checkbox">
              Skip&nbsp;
              <input
                id="skip-html"
                name="html-mode"
                type="radio"
                value="skip"
                checked={skipChecked}
                onChange={this.handleChange}
              />
            </label>
          </fieldset>
        </form>
      </div>
    )
  }
}

MarkdownControls.defaultProps = {
  mode: 'raw'
}

MarkdownControls.propTypes = {
  mode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

module.exports = MarkdownControls
