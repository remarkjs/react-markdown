'use strict'

const xtend = require('xtend')
const unified = require('unified')
const parse = require('remark-parse')
const PropTypes = require('prop-types')
const addListMetadata = require('mdast-add-list-metadata')
const naiveHtml = require('./plugins/naive-html')
const disallowNode = require('./plugins/disallow-node')
const astToReact = require('./ast-to-react')
const wrapTableRows = require('./wrap-table-rows')
const getDefinitions = require('./get-definitions')
const uriTransformer = require('./uri-transformer')
const defaultRenderers = require('./renderers')
const symbols = require('./symbols')

const allTypes = Object.keys(defaultRenderers)

const ReactMarkdown = function ReactMarkdown(props) {
  const src = props.source || props.children || ''

  if (props.allowedTypes && props.disallowedTypes) {
    throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined')
  }

  const renderers = xtend(defaultRenderers, props.renderers)

  const processor = unified()
    .use(parse)
    .use(props.plugins || [])

  // eslint-disable-next-line no-sync
  let tree = processor.runSync(processor.parse(src))

  const renderProps = xtend(props, {renderers: renderers, definitions: getDefinitions(tree)})

  determineAstToReactTransforms(props).forEach((transform) => {
    tree = transform(tree, renderProps)
  })

  return tree
}

function determineAstToReactTransforms(props) {
  let transforms = [wrapTableRows, addListMetadata()]

  let disallowedTypes = props.disallowedTypes
  if (props.allowedTypes) {
    disallowedTypes = allTypes.filter(
      (type) => type !== 'root' && props.allowedTypes.indexOf(type) === -1
    )
  }

  const removalMethod = props.unwrapDisallowed ? 'unwrap' : 'remove'
  if (disallowedTypes && disallowedTypes.length > 0) {
    transforms.push(disallowNode.ofType(disallowedTypes, removalMethod))
  }

  if (props.allowNode) {
    transforms.push(disallowNode.ifNotMatch(props.allowNode, removalMethod))
  }

  const renderHtml = !props.escapeHtml && !props.skipHtml
  const hasHtmlParser = (props.astPlugins || []).some(
    (transform) => transform.identity === symbols.HtmlParser
  )

  if (renderHtml && !hasHtmlParser) {
    transforms.push(naiveHtml)
  }

  if (props.astPlugins) {
    transforms = transforms.concat(props.astPlugins)
  }

  // Add the final transform to turn everything into React.
  transforms.push(astToReact)

  return transforms
}

ReactMarkdown.defaultProps = {
  escapeHtml: true,
  transformLinkUri: uriTransformer
}

ReactMarkdown.propTypes = {
  className: PropTypes.string,
  source: PropTypes.string,
  children: PropTypes.string,
  sourcePos: PropTypes.bool,
  rawSourcePos: PropTypes.bool,
  escapeHtml: PropTypes.bool,
  skipHtml: PropTypes.bool,
  allowNode: PropTypes.func,
  allowedTypes: PropTypes.arrayOf(PropTypes.oneOf(allTypes)),
  disallowedTypes: PropTypes.arrayOf(PropTypes.oneOf(allTypes)),
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  linkTarget: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  transformImageUri: PropTypes.func,
  astPlugins: PropTypes.arrayOf(PropTypes.func),
  unwrapDisallowed: PropTypes.bool,
  renderers: PropTypes.object,
  plugins: PropTypes.array
}

ReactMarkdown.types = allTypes
ReactMarkdown.renderers = defaultRenderers
ReactMarkdown.uriTransformer = uriTransformer

module.exports = ReactMarkdown
