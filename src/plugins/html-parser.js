/**
 * Full blown HTML parsing based on htmlparser2.
 * Pulls in a heavy set of dependencies and thus WILL bloat your bundle size.
 * You have been warned.
 **/
const React = require('react')
const visit = require('unist-util-visit')
const HtmlToReact = require('html-to-react')

const type = 'parsedHtml'
const selfClosingRe = /^<(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\s*\/?>$/i
const startTagRe = /^<([a-z]+)\b/i
const closingTagRe = /^<\/([a-z]+)\s*>$/

const parser = new HtmlToReact.Parser()
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React)

const defaultConfig = {
  isValidNode: (node) => node.type !== 'script',
  processingInstructions: [
    {
      shouldProcessNode: () => true,
      processNode: processNodeDefinitions.processDefaultNode
    }
  ]
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

  /* istanbul ignore if - seems to never happen. Hiding it because we plan on
   * moving to rehype. */
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
  /* istanbul ignore next - seems it’s always a start tag, hiding it because we
   * plan on moving to rehype. */
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

module.exports = function getHtmlParserPlugin(options, _2) {
  if (_2 && typeof options.children !== 'undefined') {
    throw new Error(
      'react-markdown: `html-parser` must be called before use - see https://github.com/remarkjs/react-markdown#parsing-html'
    )
  }

  const config = Object.assign({}, defaultConfig, options || {})

  return parseHtml

  function parseHtml(tree) {
    let open
    let currentParent
    visit(
      tree,
      'html',
      (node, index, parent) => {
        if (currentParent !== parent) {
          open = []
          currentParent = parent
        }

        const selfClosing = getSelfClosingTagName(node)
        if (selfClosing) {
          parent.children[index] = {
            type: 'virtualHtml',
            tag: selfClosing,
            position: node.position
          }
          return
        }

        const current = parseNode(node, config)
        if (!current || current.type === type) {
          return
        }

        const matching = findAndPull(open, current.tag)

        if (matching) {
          parent.children.splice(index, 0, parsedHtml(current, matching, parent))
        } else if (!current.opening) {
          open.push(current)
        }
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
        return index
      }

      parent.children[index] = {
        type,
        element,
        value: node.value,
        position: node.position
      }

      return undefined
    })

    return tree
  }
}
