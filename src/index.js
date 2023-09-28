import {createStarryNight} from '@wooorm/starry-night'
import sourceCss from '@wooorm/starry-night/source.css'
import sourceJs from '@wooorm/starry-night/source.js'
import textMd from '@wooorm/starry-night/text.md'
import sourceTs from '@wooorm/starry-night/source.ts'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import textHtmlBasic from '@wooorm/starry-night/text.html.basic'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import React from 'react'
// @ts-expect-error: TypeScript is wrong.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import ReactDom from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
// To do: replace with `starry-night` when async plugins are supported.
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkToc from 'remark-toc'

const grammars = [
  sourceCss,
  sourceJs,
  sourceTs,
  sourceTsx,
  textHtmlBasic,
  textMd
]

const sample = `# A demo of \`react-markdown\`

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

const main = document.querySelectorAll('main')[0]
const root = ReactDom.createRoot(main)

/** @type {Awaited<ReturnType<createStarryNight>>} */
let starryNight

// eslint-disable-next-line unicorn/prefer-top-level-await -- XO is wrong.
createStarryNight(grammars).then((x) => {
  starryNight = x

  const missing = starryNight.missingScopes()
  if (missing.length > 0) {
    throw new Error('Missing scopes: `' + missing + '`')
  }

  root.render(React.createElement(Playground))
})

function Playground() {
  const [text, setText] = React.useState(sample)
  const [gfm, setGfm] = React.useState(false)
  const [raw, setRaw] = React.useState(false)
  /** @type {import('unified').PluggableList} */
  const rehypePlugins = [[rehypeHighlight, {ignoreMissing: true}]]
  /** @type {import('unified').PluggableList} */
  const remarkPlugins = [remarkSlug, remarkToc]

  if (gfm) {
    remarkPlugins.unshift(remarkGfm)
  }

  if (raw) {
    rehypePlugins.unshift(rehypeRaw)
  }

  return (
    <>
      <form className="editor">
        <div className="controls">
          <label>
            <input
              type="checkbox"
              name="gfm"
              checked={gfm}
              onChange={() => {
                setGfm(!gfm)
              }}
            />{' '}
            Use <code>remark-gfm</code>
            <span className="show-big"> (to enable GFM)</span>
          </label>
          <label>
            <input
              type="checkbox"
              name="raw"
              checked={raw}
              onChange={() => {
                setRaw(!raw)
              }}
            />{' '}
            Use <code>rehype-raw</code>
            <span className="show-big"> (to enable HTML)</span>
          </label>
        </div>
        <div className="editor-inner">
          {' '}
          <div className="draw">
            {toJsxRuntime(starryNight.highlight(text, 'text.md'), {
              jsx,
              jsxs,
              Fragment
            })}
            {/* Trailing whitespace in a `textarea` is shown, but not in a `div`
          with `white-space: pre-wrap`.
          Add a `br` to make the last newline explicit. */}
            {/\n[ \t]*$/.test(text) ? <br /> : undefined}
          </div>
          <textarea
            spellCheck="false"
            className="write"
            value={text}
            rows={text.split('\n').length + 1}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
      </form>
      <div className="result">
        <ReactMarkdown
          className="markdown-body"
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
        >
          {text}
        </ReactMarkdown>
      </div>
    </>
  )
}
