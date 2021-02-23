'use strict'

const unified = require('unified')
const parse = require('remark-parse')
const PropTypes = require('prop-types')
const addListMetadata = require('mdast-add-list-metadata')
const astToReact = require('./ast-to-react')
const wrapTableRows = require('./remark-wrap-table-rows')
const filterNodes = require('./remark-filter-nodes')
const parseHtml = require('./remark-parse-html')
const getDefinitions = require('./get-definitions')
const uriTransformer = require('./uri-transformer')
const defaultRenderers = require('./renderers')

let warningIssuedSource
let warningIssuedEscapeHtml

function ReactMarkdown(props) {
  if ('source' in props && !warningIssuedSource) {
    console.warn('[react-markdown] Warning: please use `children` instead of `source`')
    warningIssuedSource = true
  }

  if ('escapeHtml' in props && !warningIssuedEscapeHtml) {
    console.warn(
      '[react-markdown] Warning: please use `allowDangerousHtml` instead of `escapeHtml`'
    )
    warningIssuedEscapeHtml = true
  }

  const processor = unified()
    .use(parse)
    .use(props.plugins || [])
    .use(wrapTableRows)
    .use(addListMetadata)
    .use(filterNodes, props)
    .use(parseHtml, props)

  // eslint-disable-next-line no-sync
  const tree = processor.runSync(processor.parse(props.children || ''))

  return astToReact(
    tree,
    Object.assign({}, props, {
      renderers: Object.assign({}, defaultRenderers, props.renderers),
      definitions: getDefinitions(tree)
    })
  )
}

ReactMarkdown.defaultProps = {
  transformLinkUri: uriTransformer
}

ReactMarkdown.propTypes = {
  className: PropTypes.string,
  children: PropTypes.string,
  sourcePos: PropTypes.bool,
  rawSourcePos: PropTypes.bool,
  allowDangerousHtml: PropTypes.bool,
  skipHtml: PropTypes.bool,
  allowNode: PropTypes.func,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  disallowedTypes: PropTypes.arrayOf(PropTypes.string),
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  linkTarget: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  transformImageUri: PropTypes.func,
  htmlParser: PropTypes.func,
  unwrapDisallowed: PropTypes.bool,
  renderers: PropTypes.object,
  plugins: PropTypes.array
}

ReactMarkdown.types = Object.keys(defaultRenderers)
ReactMarkdown.renderers = defaultRenderers
ReactMarkdown.uriTransformer = uriTransformer

module.exports = ReactMarkdown
