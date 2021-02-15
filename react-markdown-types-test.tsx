import * as React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactMarkdown from 'react-markdown'
import * as ReactMarkdownWitHtml from 'react-markdown/with-html'

/* must have children */
let test = <ReactMarkdown># header</ReactMarkdown>
test = <ReactMarkdown children="# header" />
// $ExpectError
test = <ReactMarkdown />

/* should support allowedTypes or disallowedTypes, but not both */
test = <ReactMarkdown allowedTypes={['heading']}># header</ReactMarkdown>
test = <ReactMarkdown disallowedTypes={['heading']}># header</ReactMarkdown>
test = (
  <ReactMarkdown disallowedTypes={['heading']} unwrapDisallowed>
    # header
  </ReactMarkdown>
)
test = (
  <ReactMarkdown allowedTypes={['heading']} unwrapDisallowed>
    # header
  </ReactMarkdown>
)
test = (
  // $ExpectError
  <ReactMarkdown allowedTypes={['heading']} disallowedTypes={['heading']}>
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
