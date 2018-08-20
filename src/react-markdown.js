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
const uriTransformer = require('./uriTransformer')
const defaultRenderers = require('./renderers')

const allTypes = Object.keys(defaultRenderers)

const ReactMarkdown = function ReactMarkdown(props) {
  const src = props.source || props.children || ''
  const remarkParseOptions = props.remarkParseOptions;

  if (props.allowedTypes && props.disallowedTypes) {
    throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined')
  }

  const renderers = xtend(defaultRenderers, props.renderers)

  const plugins = [[parse, remarkParseOptions]].concat(props.plugins || [])
  const parser = plugins.reduce(applyParserPlugin, unified())

  const rawAst = parser.parse(src)
  const renderProps = xtend(props, {
    renderers: renderers,
    definitions: getDefinitions(rawAst)
  })

  const astPlugins = determineAstPlugins(props)
  const ast = astPlugins.reduce((node, plugin) => plugin(node, renderProps), rawAst)

  return astToReact(ast, renderProps)
}

function applyParserPlugin(parser, plugin) {
  return Array.isArray(plugin) ? parser.use(...plugin) : parser.use(plugin)
}

function determineAstPlugins(props) {
  const plugins = [wrapTableRows, addListMetadata()]

  let disallowedTypes = props.disallowedTypes
  if (props.allowedTypes) {
    disallowedTypes = allTypes.filter(
      type => type !== 'root' && props.allowedTypes.indexOf(type) === -1
    )
  }

  const removalMethod = props.unwrapDisallowed ? 'unwrap' : 'remove'
  if (disallowedTypes && disallowedTypes.length > 0) {
    plugins.push(disallowNode.ofType(disallowedTypes, removalMethod))
  }

  if (props.allowNode) {
    plugins.push(disallowNode.ifNotMatch(props.allowNode, removalMethod))
  }

  const renderHtml = !props.escapeHtml && !props.skipHtml
  if (renderHtml) {
    plugins.push(naiveHtml)
  }

  return props.astPlugins ? plugins.concat(props.astPlugins) : plugins
}

ReactMarkdown.defaultProps = {
  renderers: {},
  escapeHtml: true,
  skipHtml: false,
  sourcePos: false,
  rawSourcePos: false,
  transformLinkUri: uriTransformer,
  astPlugins: [],
  plugins: [],
  remarkParseOptions: {},
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
  transformImageUri: PropTypes.func,
  astPlugins: PropTypes.arrayOf(PropTypes.func),
  unwrapDisallowed: PropTypes.bool,
  renderers: PropTypes.object,
  plugins: PropTypes.array,
  remarkParseOptions: PropTypes.object,
}

ReactMarkdown.types = allTypes
ReactMarkdown.renderers = defaultRenderers
ReactMarkdown.uriTransformer = uriTransformer

module.exports = ReactMarkdown
