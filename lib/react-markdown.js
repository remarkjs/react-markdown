'use strict';

var xtend = require('xtend');
var unified = require('unified');
var parse = require('remark-parse');
var PropTypes = require('prop-types');
var naiveHtml = require('./plugins/naive-html');
var disallowNode = require('./plugins/disallow-node');
var astToReact = require('./ast-to-react');
var wrapTableRows = require('./wrap-table-rows');
var getDefinitions = require('./get-definitions');
var uriTransformer = require('./uriTransformer');
var defaultRenderers = require('./renderers');

var allTypes = Object.keys(defaultRenderers);

var ReactMarkdown = function ReactMarkdown(props) {
  var src = props.source || props.children || '';

  if (props.allowedTypes && props.disallowedTypes) {
    throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined');
  }

  var renderers = xtend(defaultRenderers, props.renderers);

  var plugins = [parse].concat(props.plugins || []);
  var parser = plugins.reduce(applyParserPlugin, unified());

  var rawAst = parser.parse(src);
  var renderProps = xtend(props, {
    renderers: renderers,
    definitions: getDefinitions(rawAst)
  });

  var astPlugins = determineAstPlugins(props);
  var ast = astPlugins.reduce(function (node, plugin) {
    return plugin(node, renderProps);
  }, rawAst);

  return astToReact(ast, renderProps);
};

function applyParserPlugin(parser, plugin) {
  return Array.isArray(plugin) ? parser.use(plugin[0], plugin[1]) : parser.use(plugin);
}

function determineAstPlugins(props) {
  var plugins = [wrapTableRows];

  var disallowedTypes = props.disallowedTypes;
  if (props.allowedTypes) {
    disallowedTypes = allTypes.filter(function (type) {
      return type !== 'root' && props.allowedTypes.indexOf(type) === -1;
    });
  }

  var removalMethod = props.unwrapDisallowed ? 'unwrap' : 'remove';
  if (disallowedTypes && disallowedTypes.length > 0) {
    plugins.push(disallowNode.ofType(disallowedTypes, removalMethod));
  }

  if (props.allowNode) {
    plugins.push(disallowNode.ifNotMatch(props.allowNode, removalMethod));
  }

  var renderHtml = !props.escapeHtml && !props.skipHtml;
  if (renderHtml) {
    plugins.push(naiveHtml);
  }

  return props.astPlugins ? plugins.concat(props.astPlugins) : plugins;
}

ReactMarkdown.defaultProps = {
  renderers: {},
  escapeHtml: true,
  skipHtml: false,
  transformLinkUri: uriTransformer
};

ReactMarkdown.propTypes = {
  className: PropTypes.string,
  source: PropTypes.string,
  children: PropTypes.string,
  sourcePos: PropTypes.bool,
  escapeHtml: PropTypes.bool,
  skipHtml: PropTypes.bool,
  allowNode: PropTypes.func,
  allowedTypes: PropTypes.arrayOf(PropTypes.oneOf(allTypes)),
  disallowedTypes: PropTypes.arrayOf(PropTypes.oneOf(allTypes)),
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  transformImageUri: PropTypes.func,
  astPlugins: PropTypes.arrayOf(PropTypes.func),
  unwrapDisallowed: PropTypes.bool,
  renderers: PropTypes.object
};

ReactMarkdown.types = allTypes;
ReactMarkdown.renderers = defaultRenderers;
ReactMarkdown.uriTransformer = uriTransformer;

module.exports = ReactMarkdown;