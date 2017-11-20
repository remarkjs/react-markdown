'use strict'

module.exports = function getDefinitions(node, defs = {}) {
  return (node.children || []).reduce((definitions, child) => {
    if (child.type === 'definition') {
      definitions[child.identifier] = {
        href: child.url,
        title: child.title
      }
    }

    return getDefinitions(child, definitions)
  }, defs)
}
