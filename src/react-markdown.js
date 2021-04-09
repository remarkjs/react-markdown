'use strict'

const React = require('react')
const unified = require('unified')
const parse = require('remark-parse')
const remarkRehype = require('remark-rehype')
const PropTypes = require('prop-types')
const convert = require('unist-util-is/convert')
const html = require('property-information/html')
const filter = require('./rehype-filter')
const uriTransformer = require('./uri-transformer')
const childrenToReact = require('./ast-to-react.js').hastChildrenToReact

module.exports = ReactMarkdown

const root = convert('root')

let warningIssued

function ReactMarkdown(options) {
  if ('source' in options && !warningIssued) {
    console.warn('[react-markdown] Warning: please use `children` instead of `source`')
    warningIssued = true
  }

  const processor = unified()
    .use(parse)
    // To do: deprecate `plugins` in v7.0.0.
    .use(options.remarkPlugins || options.plugins || [])
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(options.rehypePlugins || [])
    .use(filter, options)

  // eslint-disable-next-line no-sync
  const hastNode = processor.runSync(processor.parse(options.children || ''))

  if (!root(hastNode)) {
    throw new Error('Expected a `root` node')
  }

  let result = React.createElement(
    React.Fragment,
    {},
    childrenToReact({options: options, schema: html, listDepth: 0}, hastNode)
  )

  if (options.className) {
    result = React.createElement('div', {className: options.className}, result)
  }

  return result
}

ReactMarkdown.defaultProps = {transformLinkUri: uriTransformer}

ReactMarkdown.propTypes = {
  className: PropTypes.string,
  children: PropTypes.string,
  sourcePos: PropTypes.bool,
  rawSourcePos: PropTypes.bool,
  skipHtml: PropTypes.bool,
  allowElement: PropTypes.func,
  allowedElements: PropTypes.arrayOf(PropTypes.string),
  disallowedElements: PropTypes.arrayOf(PropTypes.string),
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  linkTarget: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  transformImageUri: PropTypes.func,
  htmlParser: PropTypes.func,
  unwrapDisallowed: PropTypes.bool,
  components: PropTypes.object,
  remarkPlugins: PropTypes.array,
  rehypePlugins: PropTypes.array
}

ReactMarkdown.uriTransformer = uriTransformer
