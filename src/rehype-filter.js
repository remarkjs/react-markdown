const visit = require('unist-util-visit')

module.exports = rehypeFilter

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 *
 * @callback AllowElement
 * @param {Element} element
 * @param {number} index
 * @param {Element|Root} parent
 * @returns {boolean|undefined}
 *
 * @typedef RehypeFilterOptions
 * @property {Array.<string>} [allowedElements]
 * @property {Array.<string>} [disallowedElements=[]]
 * @property {AllowElement} [allowElement]
 * @property {boolean} [unwrapDisallowed=false]
 */

/**
 * @type {import('unified').Plugin<[RehypeFilterOptions]>}
 */
function rehypeFilter(options) {
  if (options.allowedElements && options.disallowedElements) {
    throw new TypeError(
      'Only one of `allowedElements` and `disallowedElements` should be defined'
    )
  }

  if (
    options.allowedElements ||
    options.disallowedElements ||
    options.allowElement
  ) {
    return (tree) => {
      const node = /** @type {Root} */ (tree)
      visit(node, 'element', onelement)
    }
  }

  /**
   * @param {Node} node_
   * @param {number|null|undefined} index
   * @param {Node|null|undefined} parent_
   * @returns {number|void}
   */
  function onelement(node_, index, parent_) {
    const node = /** @type {Element} */ (node_)
    const parent = /** @type {Element|Root} */ (parent_)
    /** @type {boolean|undefined} */
    let remove

    if (options.allowedElements) {
      remove = !options.allowedElements.includes(node.tagName)
    } else if (options.disallowedElements) {
      remove = options.disallowedElements.includes(node.tagName)
    }

    if (!remove && options.allowElement && typeof index === 'number') {
      remove = !options.allowElement(node, index, parent)
    }

    if (remove && typeof index === 'number') {
      if (options.unwrapDisallowed && node.children) {
        parent.children.splice(index, 1, ...node.children)
      } else {
        parent.children.splice(index, 1)
      }

      return index
    }

    return undefined
  }
}
