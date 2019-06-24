/**
 * Full blown HTML parsing based on htmlparser2.
 * Pulls in a heavy set of dependencies and thus WILL bloat your bundle size.
 * You have been warned.
 **/
const React = require('react')
const xtend = require('xtend')
const visit = require('unist-util-visit')
const HtmlToReact = require('html-to-react')
const symbols = require('../symbols')

const type = 'parsedHtml'
const selfClosingRe = /^<(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\s*\/?>$/i
const startTagRe = /^<([a-z]+)\b/i
const closingTagRe = /^<\/([a-z]+)\s*>$/

const parser = new HtmlToReact.Parser()
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React)

const defaultConfig = {
  isValidNode: node => node.type !== 'script',
  processingInstructions: [
    {
      shouldProcessNode: () => true,
      processNode: processNodeDefinitions.processDefaultNode
    }
  ]
}

function parseHtml(config, tree, props) {
  let open
  let currentParent
  visit(
    tree,
    'html',
    (node, index, parent) => {
      if (props.escapeHtml) {
        parent.children.splice(index, 1, {
          type: 'text',
          position: node.position,
          value: node.value
        })
        return true
      }

      if (props.skipHtml) {
        parent.children.splice(index, 1)
        return true
      }

      if (currentParent !== parent) {
        open = []
        currentParent = parent
      }

      const selfClosing = getSelfClosingTagName(node)
      if (selfClosing) {
        parent.children.splice(index, 1, {
          type: 'virtualHtml',
          tag: selfClosing,
          position: node.position
        })
        return true
      }

      const current = parseNode(node, config)
      if (!current || current.type === type) {
        return true
      }

      const matching = findAndPull(open, current.tag)

      if (matching) {
        parent.children.splice(index, 0, parsedHtml(current, matching, parent))
      } else if (!current.opening) {
        open.push(current)
      }

      return true
    },
    true // Iterate in reverse
  )

  // Find any leftover HTML elements and blindly replace them with a parsed version
  visit(tree, 'html', (node, index, parent) => {
    const element = parser.parseWithInstructions(
      node.value,
      config.isValidNode,
      config.processingInstructions
    )

    if (!element) {
      parent.children.splice(index, 1)
      return true
    }

    parent.children.splice(index, 1, {
      type,
      element,
      value: node.value,
      position: node.position
    })

    return true
  })

  return tree
}

function findAndPull(open, matchingTag) {
  let i = open.length
  while (i--) {
    if (open[i].tag === matchingTag) {
      return open.splice(i, 1)[0]
    }
  }

  return false
}

function parseNode(node, config) {
  const match = node.value.trim().match(closingTagRe)
  if (match) {
    return {tag: match[1], opening: false, node}
  }

  const el = parser.parseWithInstructions(
    node.value,
    config.isValidNode,
    config.processingInstructions
  )

  if (!el) {
    return false
  }

  const isMultiple = React.Children.count(el) > 1
  const isSelfClosing = !isMultiple && selfClosingRe.test(`<${el.type}>`)
  if (isMultiple || isSelfClosing) {
    return {
      type,
      position: node.position,
      node: el
    }
  }

  const startTagMatch = node.value.trim().match(startTagRe)
  const tag = startTagMatch ? startTagMatch[1] : el.type
  return {tag, opening: true, node, element: el}
}

function getSelfClosingTagName(node) {
  const match = node.value.match(selfClosingRe)
  return match ? match[1] : false
}

function parsedHtml(fromNode, toNode, parent) {
  const fromIndex = parent.children.indexOf(fromNode.node)
  const toIndex = parent.children.indexOf(toNode.node)

  const extracted = parent.children.splice(fromIndex, toIndex - fromIndex + 1)
  const children = extracted.slice(1, -1)
  return {
    type,
    children,
    tag: fromNode.tag,
    element: fromNode.element,
    value: fromNode.node.value,
    position: {
      start: fromNode.node.position.start,
      end: toNode.node.position.end,
      indent: []
    }
  }
}

module.exports = function getHtmlParserPlugin(config, props) {
  if (props && (typeof config.source !== 'undefined' || typeof config.children !== 'undefined')) {
    throw new Error(
      'react-markdown: `html-parser` must be called before use - see https://github.com/rexxars/react-markdown#parsing-html'
    )
  }

  const htmlConfig = xtend(defaultConfig, config || {})
  const plugin = parseHtml.bind(null, htmlConfig)
  plugin.identity = symbols.HtmlParser
  return plugin
}
