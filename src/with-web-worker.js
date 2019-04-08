'use strict'

const React = require('react');
const xtend = require('xtend')
const ReactMarkdown = require('./react-markdown')
const WebWorker = require('worker-loader!./parser.worker.js');

function ReactMarkdownWithWebWorker(props) {
  const webWorker = new WebWorker()
  return React.createElement(ReactMarkdown, xtend(props, { webWorker }))
}

ReactMarkdownWithWebWorker.defaultProps = ReactMarkdown.defaultProps
ReactMarkdownWithWebWorker.propTypes = ReactMarkdown.propTypes
ReactMarkdownWithWebWorker.types = ReactMarkdown.types
ReactMarkdownWithWebWorker.renderers = ReactMarkdown.renderers
ReactMarkdownWithWebWorker.uriTransformer = ReactMarkdown.uriTransformer

module.exports = ReactMarkdownWithWebWorker
