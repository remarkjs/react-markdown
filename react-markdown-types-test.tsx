import * as React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactMarkdown from 'react-markdown'
import * as ReactMarkdownWitHtml from 'react-markdown/with-html'

/* should work with default props */
let test = <ReactMarkdown># header</ReactMarkdown>
test = <ReactMarkdown source="# header"></ReactMarkdown>

/* should error if no markdown is passed or if two different markdown inputs are passed */
// $ExpectError
test = <ReactMarkdown />
// $ExpectError
test = <ReactMarkdown source="# header"># header</ReactMarkdown>
// $ExpectError
test = <ReactMarkdown source="# header" children="# header" />

/* should support allowedTypes or disallowedTypes, but not both */
test = <ReactMarkdown allowedTypes={["heading"]}># header</ReactMarkdown>
test = <ReactMarkdown disallowedTypes={["heading"]}># header</ReactMarkdown>
test = <ReactMarkdown disallowedTypes={["heading"]} unwrapDisallowed># header</ReactMarkdown>
// $ExpectError
test = <ReactMarkdown allowedTypes={["heading"]} disallowedTypes={["heading"]}># header</ReactMarkdown>
// $ExpectError
test = <ReactMarkdown allowedTypes={["heading"]} unwrapDisallowed># header</ReactMarkdown>

/* should support skipHtml or escapeHtml, but not both */
test = <ReactMarkdown escapeHtml># header</ReactMarkdown>
test = <ReactMarkdown skipHtml># header</ReactMarkdown>
// $ExpectError
test = <ReactMarkdown escapeHtml skipHtml># header</ReactMarkdown>

ReactDom.render(<ReactMarkdown># header</ReactMarkdown>, document.body)
ReactDom.render(<ReactMarkdownWitHtml># header</ReactMarkdownWitHtml>, document.body)
