'use strict'

const xtend = require('xtend')
const ReactMarkdown = require('./react-markdown')
const htmlParser = require('./plugins/html-parser')

const parseHtml = htmlParser()

module.exports = function ReactMarkdownWithHtml(props) {
  const astPlugins = [parseHtml].concat(props.astPlugins || [])
  return ReactMarkdown(xtend(props, {astPlugins}))
}
