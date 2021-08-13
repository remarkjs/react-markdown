import React from 'react'
import ReactDOM from 'react-dom'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkToc from 'remark-toc'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import {CodeMirrorEditor} from './codemirror.js'

const initialValue = `# A demo of \`react-markdown\`

\`react-markdown\` is a markdown component for React.

👉 Changes are re-rendered as you type.

👈 Try writing some markdown on the left.

## Overview

* Follows [CommonMark](https://commonmark.org)
* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
* Lets you define your own components (to render \`MyHeading\` instead of \`h1\`)
* Has a lot of plugins

## Table of contents

Here is an example of a plugin in action
([\`remark-toc\`](https://github.com/remarkjs/remark-toc)).
This section is replaced by an actual table of contents.

## Syntax highlighting

Here is an example of a plugin to highlight code:
[\`rehype-highlight\`](https://github.com/rehypejs/rehype-highlight).

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

ReactDOM.render(
  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{'# Your markdown here'}</ReactMarkdown>,
  document.querySelector('#content')
)
\`\`\`

Pretty neat, eh?

## GitHub flavored markdown (GFM)

For GFM, you can *also* use a plugin:
[\`remark-gfm\`](https://github.com/remarkjs/react-markdown#use).
It adds support for GitHub-specific extensions to the language:
tables, strikethrough, tasklists, and literal URLs.

These features **do not work by default**.
👆 Use the toggle above to add the plugin.

| Feature    | Support              |
| ---------: | :------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ \`remark-gfm\` |

~~strikethrough~~

* [ ] task list
* [x] checked item

https://example.com

## HTML in markdown

⚠️ HTML in markdown is quite unsafe, but if you want to support it, you can
use [\`rehype-raw\`](https://github.com/rehypejs/rehype-raw).
You should probably combine it with
[\`rehype-sanitize\`](https://github.com/rehypejs/rehype-sanitize).

<blockquote>
  👆 Use the toggle above to add the plugin.
</blockquote>

## Components

You can pass components to change things:

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'
import MyFancyRule from './components/my-fancy-rule.js'

ReactDOM.render(
  <ReactMarkdown
    components={{
      // Use h2s instead of h1s
      h1: 'h2',
      // Use a component instead of hrs
      hr: ({node, ...props}) => <MyFancyRule {...props} />
    }}
  >
    # Your markdown here
  </ReactMarkdown>,
  document.querySelector('#content')
)
\`\`\`

## More info?

Much more info is available in the
[readme on GitHub](https://github.com/remarkjs/react-markdown)!

***

A component by [Espen Hovlandsdal](https://espen.codes/)`

class Demo extends React.PureComponent {
  constructor(props) {
    super(props)

    this.onControlsChange = this.onControlsChange.bind(this)
    this.onSourceChange = this.onSourceChange.bind(this)
    this.state = {
      value: initialValue,
      rehypePlugins: [[rehypeHighlight, {ignoreMissing: true}]],
      remarkPlugins: [remarkSlug, remarkToc]
    }
  }

  onSourceChange(evt) {
    this.setState({value: evt.target.value})
  }

  onControlsChange(event) {
    const name = event.target.name
    const checked = event.target.checked

    if (name === 'gfm') {
      this.setState({
        remarkPlugins: (checked ? [remarkGfm] : []).concat(
          remarkSlug,
          remarkToc
        )
      })
    } else {
      this.setState({
        rehypePlugins: (checked ? [rehypeRaw] : []).concat(rehypeHighlight)
      })
    }
  }

  render() {
    return (
      <>
        <div className="editor">
          <form className="controls">
            <label>
              <input
                name="gfm"
                type="checkbox"
                onChange={this.onControlsChange}
              />{' '}
              Use <code>remark-gfm</code>
              <span className="show-big"> (to enable GFM)</span>
            </label>
            <label>
              <input
                name="raw"
                type="checkbox"
                onChange={this.onControlsChange}
              />{' '}
              Use <code>rehype-raw</code>
              <span className="show-big"> (to enable HTML)</span>
            </label>
          </form>

          <form>
            <CodeMirrorEditor
              mode="markdown"
              theme="nord"
              value={this.state.value}
              onChange={this.onSourceChange}
            />
          </form>
        </div>

        <div className="result">
          <ReactMarkdown
            className="markdown-body"
            remarkPlugins={this.state.remarkPlugins}
            rehypePlugins={this.state.rehypePlugins}
          >
            {this.state.value}
          </ReactMarkdown>
        </div>
      </>
    )
  }
}

ReactDOM.render(<Demo />, document.querySelector('main'))
