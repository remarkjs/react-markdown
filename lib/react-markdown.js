/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Parents} Parents
 * @typedef {import('remark-rehype').Options} RemarkRehypeOptions
 * @typedef {import('react').ReactElement<{}>} ReactElement
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('./ast-to-react.js').Components} Components
 */

/**
 * @callback AllowElement
 *   Decide if `element` should be allowed.
 * @param {Readonly<Element>} element
 *   Element to check.
 * @param {number} index
 *   Index of `element` in `parent`.
 * @param {Readonly<Parents> | undefined} parent
 *   Parent of `element`.
 * @returns {boolean | null | undefined}
 *   Whether to allow `element` (default: `false`).
 *
 * @typedef Deprecation
 *   Deprecation.
 * @property {string} id
 *   ID in readme.
 * @property {string} [to]
 *   Field to use instead (optional).
 *
 * @typedef Options
 *   Configuration.
 * @property {AllowElement | null | undefined} [allowElement]
 *   Function called to check if an element is allowed (when truthy) or not,
 *   `allowedElements` or `disallowedElements` is used first!
 * @property {ReadonlyArray<string> | null | undefined} [allowedElements]
 *   Tag names to allow (cannot combine w/ `disallowedElements`), all tag names
 *   are allowed by default.
 * @property {string | null | undefined} [children]
 *   Markdown to parse.
 * @property {string | null | undefined} [className]
 *   Wrap the markdown in a `div` with this class name.
 * @property {Components | null | undefined} [components]
 *   Map tag names to React components.
 * @property {ReadonlyArray<string> | null | undefined} [disallowedElements]
 *   Tag names to disallow (cannot combine w/ `allowedElements`), all tag names
 *   are allowed by default.
 * @property {boolean | null | undefined} [includeElementIndex=false]
 *   Pass the `index` (number of elements before it) and `siblingCount` (number
 *   of elements in parent) as props to all components (default: `false`).
 * @property {boolean | null | undefined} [rawSourcePos=false]
 *   Pass a `sourcePosition` prop to all components with their position
 *   (default: `false`).
 * @property {PluggableList | null | undefined} [rehypePlugins]
 *   List of rehype plugins to use.
 * @property {PluggableList | null | undefined} [remarkPlugins]
 *   List of remark plugins to use.
 * @property {Readonly<RemarkRehypeOptions> | null | undefined} [remarkRehypeOptions]
 *   Options to pass through to `remark-rehype`.
 * @property {boolean | null | undefined} [skipHtml=false]
 *   Ignore HTML in markdown completely (default: `false`).
 * @property {boolean | null | undefined} [sourcePos=false]
 *   Pass a `data-sourcepos` prop to all components with a serialized position
 *   (default: `false`).
 * @property {TransformLink | false | null | undefined} [transformLinkUri]
 *   Change URLs on images (default: `uriTransformer`);
 *   pass `false` to allow all URLs, which is unsafe
 * @property {TransformImage | false | null | undefined} [transformImageUri]
 *   Change URLs on links (default: `uriTransformer`);
 *   pass `false` to allow all URLs, which is unsafe
 * @property {boolean | null | undefined} [unwrapDisallowed=false]
 *   Extract (unwrap) the children of not allowed elements (default: `false`);
 *   normally when say `strong` is disallowed, it and it’s children are dropped,
 *   with `unwrapDisallowed` the element itself is replaced by its children.
 *
 * @callback TransformImage
 *   Transform URLs on images.
 * @param {string} src
 *   URL to transform.
 * @param {string} alt
 *   Alt text.
 * @param {string | null} title
 *   Title.
 *   To do: pass `undefined`.
 * @returns {string | null | undefined}
 *   Transformed URL (optional).
 *
 * @callback TransformLink
 *   Transform URLs on links.
 * @param {string} href
 *   URL to transform.
 * @param {ReadonlyArray<ElementContent>} children
 *   Content.
 * @param {string | null} title
 *   Title.
 *   To do: pass `undefined`.
 * @returns {string}
 *   Transformed URL (optional).
 */

import React from 'react'
import PropTypes from 'prop-types'
import {html} from 'property-information'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'
import {VFile} from 'vfile'
import {childrenToReact} from './ast-to-react.js'
import rehypeFilter from './rehype-filter.js'

const own = {}.hasOwnProperty
const changelog =
  'https://github.com/remarkjs/react-markdown/blob/main/changelog.md'

// Mutable because we `delete` any time it’s used and a message is sent.
/** @type {Record<string, Readonly<Deprecation>>} */
const deprecated = {
  astPlugins: {id: 'remove-buggy-html-in-markdown-parser'},
  allowDangerousHtml: {id: 'remove-buggy-html-in-markdown-parser'},
  allowNode: {
    id: 'replace-allownode-allowedtypes-and-disallowedtypes',
    to: 'allowElement'
  },
  allowedTypes: {
    id: 'replace-allownode-allowedtypes-and-disallowedtypes',
    to: 'allowedElements'
  },
  disallowedTypes: {
    id: 'replace-allownode-allowedtypes-and-disallowedtypes',
    to: 'disallowedElements'
  },
  escapeHtml: {id: 'remove-buggy-html-in-markdown-parser'},
  includeNodeIndex: {
    id: 'change-includenodeindex-to-includeelementindex',
    to: 'includeElementIndex'
  },
  plugins: {id: 'change-plugins-to-remarkplugins', to: 'remarkPlugins'},
  renderers: {id: 'change-renderers-to-components', to: 'components'},
  source: {id: 'change-source-to-children', to: 'children'}
}

/**
 * Component to render markdown.
 *
 * @param {Readonly<Options>} options
 *   Configuration (required).
 *   Note: React types require that props are passed.
 * @returns {ReactElement}
 *   React element.
 */
export function ReactMarkdown(options) {
  for (const key in deprecated) {
    if (own.call(deprecated, key) && own.call(options, key)) {
      const deprecation = deprecated[key]
      console.warn(
        `[react-markdown] Warning: please ${
          deprecation.to ? `use \`${deprecation.to}\` instead of` : 'remove'
        } \`${key}\` (see <${changelog}#${deprecation.id}> for more info)`
      )
      delete deprecated[key]
    }
  }

  const processor = unified()
    .use(remarkParse)
    .use(options.remarkPlugins || [])
    .use(remarkRehype, {
      ...options.remarkRehypeOptions,
      allowDangerousHtml: true
    })
    .use(options.rehypePlugins || [])
    .use(rehypeFilter, options)

  const file = new VFile()

  if (typeof options.children === 'string') {
    file.value = options.children
  } else if (options.children !== null && options.children !== undefined) {
    console.warn(
      `[react-markdown] Warning: please pass a string as \`children\` (not: \`${options.children}\`)`
    )
  }

  const hastNode = processor.runSync(processor.parse(file), file)

  if (hastNode.type !== 'root') {
    throw new TypeError('Expected a `root` node')
  }

  /** @type {ReactElement} */
  let result = React.createElement(
    React.Fragment,
    {},
    childrenToReact({options, schema: html, listDepth: 0}, hastNode)
  )

  if (options.className) {
    result = React.createElement('div', {className: options.className}, result)
  }

  return result
}

ReactMarkdown.propTypes = {
  // Core options:
  children: PropTypes.string,
  // Layout options:
  className: PropTypes.string,
  // Filter options:
  allowElement: PropTypes.func,
  allowedElements: PropTypes.arrayOf(PropTypes.string),
  disallowedElements: PropTypes.arrayOf(PropTypes.string),
  unwrapDisallowed: PropTypes.bool,
  // Plugin options:
  remarkPlugins: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.string,
          PropTypes.object,
          PropTypes.func,
          PropTypes.arrayOf(
            // prettier-ignore
            // type-coverage:ignore-next-line
            PropTypes.any
          )
        ])
      )
    ])
  ),
  rehypePlugins: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.string,
          PropTypes.object,
          PropTypes.func,
          PropTypes.arrayOf(
            // prettier-ignore
            // type-coverage:ignore-next-line
            PropTypes.any
          )
        ])
      )
    ])
  ),
  // Transform options:
  sourcePos: PropTypes.bool,
  rawSourcePos: PropTypes.bool,
  skipHtml: PropTypes.bool,
  includeElementIndex: PropTypes.bool,
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  transformImageUri: PropTypes.func,
  components: PropTypes.object
}
