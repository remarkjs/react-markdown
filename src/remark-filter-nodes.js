const visit = require('unist-util-visit')

const splice = [].splice

module.exports = remarkFilterNodes

function remarkFilterNodes(options) {
  if (options.allowedTypes && options.disallowedTypes) {
    throw new Error('Only one of `allowedTypes` and `disallowedTypes` should be defined')
  }

  return options.allowedTypes || options.disallowedTypes || options.allowNode
    ? transform
    : undefined

  function transform(tree) {
    visit(tree, onnode)
  }

  function onnode(node, index, parent) {
    let remove

    if (parent) {
      if (options.allowedTypes) {
        remove = !options.allowedTypes.includes(node.type)
      } else if (options.disallowedTypes) {
        remove = options.disallowedTypes.includes(node.type)
      }

      if (!remove && options.allowNode) {
        remove = !options.allowNode(node, index, parent)
      }
    }

    if (remove) {
      let parameters = [index, 1]

      if (options.unwrapDisallowed && node.children) {
        parameters = parameters.concat(node.children)
      }

      splice.apply(parent.children, parameters)
      return index
    }

    return undefined
  }
}
