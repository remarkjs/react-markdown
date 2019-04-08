'use strict'

const React = require('react');
const xtend = require('xtend')
const ReactMarkdown = require('./react-markdown')
const htmlParser = require('./plugins/html-parser')

const parseHtml = htmlParser()

function ReactMarkdownWithHtml(props) {
  const astPlugins = [parseHtml].concat(props.astPlugins || [])
  return React.createElement(ReactMarkdown, xtend(props, {astPlugins}))
}

ReactMarkdownWithHtml.defaultProps = ReactMarkdown.defaultProps
ReactMarkdownWithHtml.propTypes = ReactMarkdown.propTypes
ReactMarkdownWithHtml.types = ReactMarkdown.types
ReactMarkdownWithHtml.renderers = ReactMarkdown.renderers
ReactMarkdownWithHtml.uriTransformer = ReactMarkdown.uriTransformer

module.exports = ReactMarkdownWithHtml
