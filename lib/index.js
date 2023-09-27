// Register `Raw` in tree:
/// <reference types="mdast-util-to-hast" />

/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('hast').Nodes} Nodes
 * @typedef {import('hast').Parents} Parents
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast-util-to-jsx-runtime').Components} Components
 * @typedef {import('remark-rehype').Options} RemarkRehypeOptions
 * @typedef {import('unist-util-visit').BuildVisitor<Root>} Visitor
 * @typedef {import('unified').PluggableList} PluggableList
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
 * @property {Partial<Components> | null | undefined} [components]
 *   Map tag names to React components.
 * @property {ReadonlyArray<string> | null | undefined} [disallowedElements]
 *   Tag names to disallow (cannot combine w/ `allowedElements`), all tag names
 *   are allowed by default.
 * @property {PluggableList | null | undefined} [rehypePlugins]
 *   List of rehype plugins to use.
 * @property {PluggableList | null | undefined} [remarkPlugins]
 *   List of remark plugins to use.
 * @property {Readonly<RemarkRehypeOptions> | null | undefined} [remarkRehypeOptions]
 *   Options to pass through to `remark-rehype`.
 * @property {boolean | null | undefined} [skipHtml=false]
 *   Ignore HTML in markdown completely (default: `false`).
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

import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import PropTypes from 'prop-types'
// @ts-expect-error: untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'
import {visit} from 'unist-util-visit'
import {VFile} from 'vfile'

const safeProtocols = ['http', 'https', 'mailto', 'tel']

const own = {}.hasOwnProperty
const changelog =
  'https://github.com/remarkjs/react-markdown/blob/main/changelog.md'

/** @type {PluggableList} */
const emptyPlugins = []
/** @type {Readonly<RemarkRehypeOptions>} */
const emptyRemarkRehypeOptions = {allowDangerousHtml: true}

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
  includeElementIndex: {id: '#remove-includeelementindex-option'},
  includeNodeIndex: {id: 'change-includenodeindex-to-includeelementindex'},
  plugins: {id: 'change-plugins-to-remarkplugins', to: 'remarkPlugins'},
  rawSourcePos: {id: '#remove-rawsourcepos-option'},
  renderers: {id: 'change-renderers-to-components', to: 'components'},
  source: {id: 'change-source-to-children', to: 'children'},
  sourcePos: {id: '#remove-sourcepos-option'}
}

/**
 * Component to render markdown.
 *
 * @param {Readonly<Options>} options
 *   Configuration (required).
 *   Note: React types require that props are passed.
 * @returns {JSX.Element}
 *   React element.
 */
export function Markdown(options) {
  const allowedElements = options.allowedElements
  const allowElement = options.allowElement
  const children = options.children || ''
  const className = options.className
  const components = options.components
  const disallowedElements = options.disallowedElements
  const rehypePlugins = options.rehypePlugins || emptyPlugins
  const remarkPlugins = options.remarkPlugins || emptyPlugins
  const remarkRehypeOptions = options.remarkRehypeOptions
    ? {...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions}
    : emptyRemarkRehypeOptions
  const skipHtml = options.skipHtml
  const transformImageUri =
    options.transformImageUri === undefined
      ? uriTransformer
      : options.transformImageUri
  const transformLinkUri =
    options.transformLinkUri === undefined
      ? uriTransformer
      : options.transformLinkUri
  const unwrapDisallowed = options.unwrapDisallowed

  const processor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, remarkRehypeOptions)
    .use(rehypePlugins)

  const file = new VFile()

  if (typeof children === 'string') {
    file.value = children
  } else {
    console.warn(
      '[react-markdown] Warning: please pass a string as `children` (not: `' +
        children +
        '`)'
    )
  }

  if (allowedElements && disallowedElements) {
    throw new TypeError(
      'Unexpected combined `allowedElements` and `disallowedElements`, expected one or the other'
    )
  }

  for (const key in deprecated) {
    // To do: use `Object.hasOwn`.
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

  const mdastTree = processor.parse(file)
  /** @type {Nodes} */
  let hastTree = processor.runSync(mdastTree, file)

  // Wrap in `div` if there’s a class name.
  if (className) {
    hastTree = {
      type: 'element',
      tagName: 'div',
      properties: {className},
      // Assume no doctypes.
      children: /** @type {Array<ElementContent>} */ (
        hastTree.type === 'root' ? hastTree.children : [hastTree]
      )
    }
  }

  visit(hastTree, transform)

  return toJsxRuntime(hastTree, {
    Fragment,
    components,
    ignoreInvalidStyle: true,
    jsx,
    jsxs,
    passKeys: true,
    passNode: true
  })

  /** @type {Visitor} */
  function transform(node, index, parent) {
    if (node.type === 'raw' && parent && typeof index === 'number') {
      if (skipHtml) {
        parent.children.splice(index, 1)
      } else {
        parent.children[index] = {type: 'text', value: node.value}
      }

      return index
    }

    if (transformLinkUri && node.type === 'element' && node.tagName === 'a') {
      node.properties.href = transformLinkUri(
        String(node.properties.href || ''),
        node.children,
        // To do: pass `undefined`.
        typeof node.properties.title === 'string' ? node.properties.title : null
      )
    }

    if (
      transformImageUri &&
      node.type === 'element' &&
      node.tagName === 'img'
    ) {
      node.properties.src = transformImageUri(
        String(node.properties.src || ''),
        String(node.properties.alt || ''),
        // To do: pass `undefined`.
        typeof node.properties.title === 'string' ? node.properties.title : null
      )
    }

    if (node.type === 'element') {
      let remove = false

      if (allowedElements) {
        remove = !allowedElements.includes(node.tagName)
      } else if (disallowedElements) {
        remove = disallowedElements.includes(node.tagName)
      }

      if (!remove && allowElement && typeof index === 'number') {
        remove = !allowElement(node, index, parent)
      }

      if (remove && parent && typeof index === 'number') {
        if (unwrapDisallowed && node.children) {
          parent.children.splice(index, 1, ...node.children)
        } else {
          parent.children.splice(index, 1)
        }

        return index
      }
    }
  }
}

Markdown.propTypes = {
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
  skipHtml: PropTypes.bool,
  transformLinkUri: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  transformImageUri: PropTypes.func,
  components: PropTypes.object
}

/**
 * Make a URL safe.
 *
 * @param {string} value
 *   URL.
 * @returns {string}
 *   Safe URL.
 */
export function uriTransformer(value) {
  const url = (value || '').trim()
  const first = url.charAt(0)

  if (first === '#' || first === '/') {
    return url
  }

  const colon = url.indexOf(':')
  if (colon === -1) {
    return url
  }

  let index = -1

  while (++index < safeProtocols.length) {
    const protocol = safeProtocols[index]

    if (
      colon === protocol.length &&
      url.slice(0, protocol.length).toLowerCase() === protocol
    ) {
      return url
    }
  }

  index = url.indexOf('?')
  if (index !== -1 && colon > index) {
    return url
  }

  index = url.indexOf('#')
  if (index !== -1 && colon > index) {
    return url
  }

  // To do: is there an alternative?
  // eslint-disable-next-line no-script-url
  return 'javascript:void(0)'
}
