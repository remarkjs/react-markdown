const React = require('react')
const ReactDOM = require('react-dom')
const Markdown = require('../../src/react-markdown')
const Editor = require('./editor')
const CodeBlock = require('./code-block')
const MarkdownControls = require('./markdown-controls')

class Demo extends React.PureComponent {
  constructor(props) {
    super(props)

    this.handleControlsChange = this.handleControlsChange.bind(this)
    this.handleMarkdownChange = this.handleMarkdownChange.bind(this)
    this.state = {
      markdownSrc: [
        '# Live demo\n\nChanges are automatically rendered as you type.\n\n* Follows the ',
        '[CommonMark](http://commonmark.org/) spec\n* Renders actual, "native" React DOM ',
        'elements\n* Allows you to escape or skip HTML (try toggling the checkboxes above)',
        '\n* If you escape or skip the HTML, no `dangerouslySetInnerHTML` is used! Yay!\n',
        '\n## HTML block below\n\n<blockquote>\n    This blockquote will change based ',
        'on the HTML settings above.\n</blockquote>\n\n## How about some code?\n',
        "```js\nvar React = require('react');\nvar Markdown = require('react-markdown');",
        '\n\nReact.render(\n    <Markdown source="# Your markdown here" />,\n    document.',
        "getElementById('content')\n);\n```\n\nPretty neat, eh?\n\n",
        '## More info?\n\n',
        'Read usage information and more on [GitHub](//github.com/rexxars/react-markdown)\n\n',
        '---------------\n\n',
        'A component by [VaffelNinja](http://vaffel.ninja) / Espen Hovlandsdal'
      ].join(''),

      htmlMode: 'raw'
    }
  }

  handleMarkdownChange(evt) {
    this.setState({markdownSrc: evt.target.value})
  }

  handleControlsChange(mode) {
    this.setState({htmlMode: mode})
  }

  render() {
    return (
      <div className="demo">
        <div className="editor-pane">
          <MarkdownControls onChange={this.handleControlsChange} mode={this.state.htmlMode} />

          <Editor value={this.state.markdownSrc} onChange={this.handleMarkdownChange} />
        </div>

        <div className="result-pane">
          <Markdown
            className="result"
            source={this.state.markdownSrc}
            skipHtml={this.state.htmlMode === 'skip'}
            escapeHtml={this.state.htmlMode === 'escape'}
            renderers={{code: CodeBlock}}
          />
        </div>
      </div>
    )
  }
}

if (typeof window !== 'undefined') {
  ReactDOM.render(<Demo />, document.getElementById('main'))
}

module.exports = Demo
