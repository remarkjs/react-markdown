const visit = require('unist-util-visit')

const splice = [].splice

module.exports = rehypeFilter

function rehypeFilter(options) {
  if (options.allowedElements && options.disallowedElements) {
    throw new TypeError('Only one of `allowedElements` and `disallowedElements` should be defined')
  }

  return options.allowedElements || options.disallowedElements || options.allowElement
    ? transform
    : undefined

  function transform(tree) {
    visit(tree, 'element', onelement)
  }

  function onelement(node, index, parent) {
    let remove

    if (options.allowedElements) {
      remove = !options.allowedElements.includes(node.tagName)
    } else if (options.disallowedElements) {
      remove = options.disallowedElements.includes(node.tagName)
    }

    if (!remove && options.allowElement) {
      remove = !options.allowElement(node, index, parent)
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
