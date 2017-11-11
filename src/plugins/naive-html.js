/**
 * Naive, simple plugin to match inline nodes without attributes
 * This allows say <strong>foo</strong>, but not <strong class="very">foo</strong>
 * For proper HTML support, you'll want a different plugin
 **/
const visit = require('unist-util-visit')

const type = 'virtualHtml'
const selfClosingRe = /^<(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)\s*\/?>$/i
const simpleTagRe = /^<(\/?)([a-z]+)\s*>$/

module.exports = function(tree) {
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

      const selfClosing = getSelfClosing(node)
      if (selfClosing) {
        parent.children.splice(index, 1, {
          type,
          tag: selfClosing,
          position: node.position
        })
        return true
      }

      const current = getSimpleTag(node, parent)
      if (!current) {
        return true
      }

      const matching = findAndPull(open, current.tag)

      if (matching) {
        parent.children.splice(index, 0, virtual(current, matching, parent))
      } else if (!current.opening) {
        open.push(current)
      }

      return true
    },
    true // Iterate in reverse
  )

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

function getSimpleTag(node, parent) {
  const match = node.value.match(simpleTagRe)
  return match ? {tag: match[2], opening: !match[1], node} : false
}

function getSelfClosing(node) {
  const match = node.value.match(selfClosingRe)
  return match ? match[1] : false
}

function virtual(fromNode, toNode, parent) {
  const fromIndex = parent.children.indexOf(fromNode.node)
  const toIndex = parent.children.indexOf(toNode.node)

  const extracted = parent.children.splice(fromIndex, toIndex - fromIndex + 1)
  const children = extracted.slice(1, -1)
  return {
    type,
    children,
    tag: fromNode.tag,
    position: {
      start: fromNode.node.position.start,
      end: toNode.node.position.end,
      indent: []
    }
  }
}
