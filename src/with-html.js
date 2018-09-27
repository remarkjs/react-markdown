'use strict'

const xtend = require('xtend')
const ReactMarkdown = require('./react-markdown')
const parseHtml = require('./plugins/parse-html')

module.exports = function ReactMarkdownWithHtml(props) {
  const astPlugins = [parseHtml()].concat(props.astPlugins || [])
  return ReactMarkdown(xtend(props, {astPlugins}))
}
