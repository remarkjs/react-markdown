const visit = require('unist-util-visit')

const splice = [].splice

module.exports = rehypeFilter

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 *
 * @callback AllowElement
 * @param {Element} element
 * @param {number} index
 * @param {Element|Root} parent
 * @returns {boolean}
 *
 * @typedef {Object} RehypeFilterOptions
 * @property {Array.<string>} [allowedElements]
 * @property {Array.<string>} [disallowedElements=[]]
 * @property {AllowElement} [allowElement]
 * @property {boolean} [unwrapDisallowed=false]
 */

/**
 * @param {RehypeFilterOptions} options
 */
function rehypeFilter(options) {
  if (options.allowedElements && options.disallowedElements) {
    throw new TypeError(
      'Only one of `allowedElements` and `disallowedElements` should be defined'
    )
  }

  return options.allowedElements ||
    options.disallowedElements ||
    options.allowElement
    ? transform
    : undefined

  /**
   * @param {Root} tree
   */
  function transform(tree) {
    visit(tree, 'element', onelement)
  }

  /**
   * @param {Element} node
   * @param {number} index
   * @param {Element|Root} parent
   * @returns {number|void}
   */
  function onelement(node, index, parent) {
    /** @type {boolean} */
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
      /** @type {Array.<unknown>} */
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
