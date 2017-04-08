'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var assign = require('lodash.assign');
var Editor = require('./editor');
var CodeBlock = require('./code-block');
var MarkdownControls = require('./markdown-controls');
var Markdown = require('../../');
var h = React.createElement;

class Demo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            markdownSrc: [
                '# Live demo\n\nChanges are automatically rendered as you type.\n\n* Follows the ',
                '[CommonMark](http://commonmark.org/) spec\n* Renders actual, "native" React DOM ',
                'elements\n* Allows you to escape or skip HTML (try toggling the checkboxes above)',
                '\n* If you escape or skip the HTML, no `dangerouslySetInnerHTML` is used! Yay!\n',
                '\n## HTML block below\n\n<blockquote>\n    This blockquote will change based ',
                'on the HTML settings above.\n</blockquote>\n\n## How about some code?\n',
                '```js\nvar React = require(\'react\');\nvar Markdown = require(\'react-markdown\');',
                '\n\nReact.render(\n    <Markdown source="# Your markdown here" />,\n    document.',
                'getElementById(\'content\')\n);\n```\n\nPretty neat, eh?\n\n', '## More info?\n\n',
                'Read usage information and more on [GitHub](//github.com/rexxars/react-markdown)\n\n',
                '---------------\n\n',
                'A component by [VaffelNinja](http://vaffel.ninja) / Espen Hovlandsdal'
            ].join(''),

            htmlMode: 'raw'
        };

        this.onMarkdownChange = this.onMarkdownChange.bind(this);
        this.onControlsChange = this.onControlsChange.bind(this);
    }

    onMarkdownChange(md) {
        this.setState({
            markdownSrc: md
        });
    }

    onControlsChange(mode) {
        this.setState({ htmlMode: mode });
    }

    render() {
        return (
            h('div', {className: 'demo'},
                h('div', {className: 'editor-pane'},
                    h(MarkdownControls, {
                        onChange: this.onControlsChange,
                        mode: this.state.htmlMode
                    }),

                    h(Editor, {
                        value: this.state.markdownSrc,
                        onChange: this.onMarkdownChange
                    })
                ),

                h('div', {className: 'result-pane'},
                    h(Markdown, {
                        className: 'result',
                        source: this.state.markdownSrc,
                        skipHtml: this.state.htmlMode === 'skip',
                        escapeHtml: this.state.htmlMode === 'escape',
                        renderers: assign({}, Markdown.renderers, {
                            CodeBlock: CodeBlock
                        })
                    })
                )
            )
        );
    }
}

module.exports = Demo;

if (typeof window !== 'undefined') {
    ReactDOM.render(h(Demo), document.getElementById('main'));
}
