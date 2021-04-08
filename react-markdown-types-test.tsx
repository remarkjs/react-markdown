import * as React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactMarkdown from 'react-markdown'
import * as ReactMarkdownWitHtml from 'react-markdown/with-html'

/* must have children */
let test = <ReactMarkdown># header</ReactMarkdown>
test = <ReactMarkdown children="# header" />
// $ExpectError
test = <ReactMarkdown />

/* should support allowedElements or disallowedElements, but not both */
test = <ReactMarkdown allowedElements={['h1']}># header</ReactMarkdown>
test = <ReactMarkdown disallowedElements={['h1']}># header</ReactMarkdown>
test = (
  <ReactMarkdown disallowedElements={['h1']} unwrapDisallowed>
    # header
  </ReactMarkdown>
)
test = (
  <ReactMarkdown allowedElements={['h1']} unwrapDisallowed>
    # header
  </ReactMarkdown>
)
test = (
  // $ExpectError
  <ReactMarkdown allowedElements={['h1']} disallowedElements={['h1']}>
    # header
  </ReactMarkdown>
)

/* should support skipHtml or allowDangerousHtml, but not both */
test = <ReactMarkdown skipHtml># header</ReactMarkdown>
test = <ReactMarkdown allowDangerousHtml># header</ReactMarkdown>
test = (
  // $ExpectError
  <ReactMarkdown skipHtml allowDangerousHtml>
    # header
  </ReactMarkdown>
)

ReactDom.render(<ReactMarkdown># header</ReactMarkdown>, document.body)
ReactDom.render(<ReactMarkdownWitHtml># header</ReactMarkdownWitHtml>, document.body)
