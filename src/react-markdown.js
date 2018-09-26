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

  if (props.allowedTypes && props.disallowedTypes) {
    throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined')
  }

  const renderers = xtend(defaultRenderers, props.renderers)

  const removedTokens = removeIgnoredParseTokens(props.ignoreTokens);
  const plugins = [parse].concat(props.plugins || [])
  const parser = plugins.reduce(applyParserPlugin, unified())

  const rawAst = parser.parse(src)
  const renderProps = xtend(props, {
    renderers: renderers,
    definitions: getDefinitions(rawAst)
  })

  const astPlugins = determineAstPlugins(props)
  const ast = astPlugins.reduce((node, plugin) => plugin(node, renderProps), rawAst)
  restoreIgnoredParseTokens(removedTokens);

  return astToReact(ast, renderProps)
}

function removeIgnoredParseTokens(ignoreTokens) {
  const interruptArrays = ['interruptParagraph', 'interruptList', 'interruptBlockquote'];
  const removedParseTokens = {
    blockTokenizers: {},
    inlineTokenizers: {},
    interruptParagraph: [],
    interruptList: [],
    interruptBlockquote: []
  };
  const proto = parse.Parser.prototype;

  if (ignoreTokens.includes('list')) throw new Error(`Cannot ignore list token`);

  ignoreTokens.forEach((token) => {
    let tokenizerGroup = null;
    if (proto.blockMethods.includes(token)) tokenizerGroup = 'blockTokenizers';
    if (proto.inlineMethods.includes(token)) tokenizerGroup = 'inlineTokenizers';
    if (tokenizerGroup) {
      removedParseTokens[tokenizerGroup][token] = proto[tokenizerGroup][token];
      delete proto[tokenizerGroup][token];

      interruptArrays.forEach(arr => {
        proto[arr] = proto[arr].filter(tkn => {
          if (tkn[0] === token) {
            removedParseTokens[arr].push(tkn);
            return false;
          }
          return true;
        });
      });
    } else {
      throw new Error(`Invalid token found in ignoreTokens prop: ${token}`)
    }
  });

  return removedParseTokens;
}

function restoreIgnoredParseTokens(removedTokens) {
  const interruptArrays = ['interruptParagraph', 'interruptList', 'interruptBlockquote'];
  const proto = parse.Parser.prototype;
  Object.assign(proto.blockTokenizers, removedTokens.blockTokenizers);
  Object.assign(proto.inlineTokenizers, removedTokens.inlineTokenizers);
  interruptArrays.forEach(arr => {
    proto[arr] = proto[arr].concat(removedTokens[arr]);
  });
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
  ignoreTokens: []
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
