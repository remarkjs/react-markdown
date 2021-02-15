'use strict'

const xtend = require('xtend')
const ReactMarkdown = require('./react-markdown')
const htmlParser = require('./plugins/html-parser')

function ReactMarkdownWithHtml(props) {
  return ReactMarkdown(xtend(props, {htmlParser: htmlParser()}))
}

ReactMarkdownWithHtml.defaultProps = ReactMarkdown.defaultProps
ReactMarkdownWithHtml.propTypes = ReactMarkdown.propTypes
ReactMarkdownWithHtml.types = ReactMarkdown.types
ReactMarkdownWithHtml.renderers = ReactMarkdown.renderers
ReactMarkdownWithHtml.uriTransformer = ReactMarkdown.uriTransformer

module.exports = ReactMarkdownWithHtml
