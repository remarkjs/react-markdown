import * as React from 'react'
import * as ReactDom from 'react-dom'
import * as ReactMarkdown from 'react-markdown'
import * as ReactMarkdownWitHtml from 'react-markdown/with-html'

ReactDom.render(<ReactMarkdown># header</ReactMarkdown>, document.body)
ReactDom.render(<ReactMarkdownWitHtml># header</ReactMarkdownWitHtml>, document.body)
