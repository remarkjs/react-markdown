'use strict'

const visit = require('unist-util-visit')

module.exports = function getDefinitions(tree, definitions = {}) {
  visit(tree, 'definition', (node) => {
    const identifier = node.identifier.toUpperCase()
    if (identifier in definitions) return
    definitions[identifier] = {href: node.url, title: node.title}
  })
  return definitions
}
