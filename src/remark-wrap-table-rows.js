'use strict'

const visit = require('unist-util-visit')

module.exports = remarkWrapTableRows

function remarkWrapTableRows() {
  return transform
}

function transform(tree) {
  visit(tree, 'table', ontable)
}

function ontable(table) {
  const children = table.children
  table.children = [
    {
      type: 'tableHead',
      align: table.align,
      children: [children[0]],
      position: children[0].position
    }
  ]
  if (children.length > 1) {
    table.children.push({
      type: 'tableBody',
      align: table.align,
      children: children.slice(1),
      position: {
        start: children[1].position.start,
        end: children[children.length - 1].position.end
      }
    })
  }
}
