/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 * @typedef {import('./react-markdown.js').Options} Options
 */

import {visit} from 'unist-util-visit'

/**
 * Filter nodes.
 *
 * @param {Readonly<Options>} options
 *   Configuration (required).
 * @returns
 *   Transform (optional).
 */
export default function rehypeFilter(options) {
  if (
    options.allowElement ||
    options.allowedElements ||
    options.disallowedElements
  ) {
    if (options.allowedElements && options.disallowedElements) {
      throw new TypeError(
        'Only one of `allowedElements` and `disallowedElements` should be defined'
      )
    }

    /**
     * Transform.
     *
     * @param {Root} tree
     *   Tree.
     * @returns {undefined}
     *   Nothing.
     */
    return function (tree) {
      visit(tree, 'element', function (node, index, parent) {
        /** @type {boolean | undefined} */
        let remove

        if (options.allowedElements) {
          remove = !options.allowedElements.includes(node.tagName)
        } else if (options.disallowedElements) {
          remove = options.disallowedElements.includes(node.tagName)
        }

        if (!remove && options.allowElement && typeof index === 'number') {
          remove = !options.allowElement(node, index, parent)
        }

        if (remove && parent && typeof index === 'number') {
          if (options.unwrapDisallowed && node.children) {
            parent.children.splice(index, 1, ...node.children)
          } else {
            parent.children.splice(index, 1)
          }

          return index
        }

        return undefined
      })
    }
  }
}
