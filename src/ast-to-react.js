'use strict'

const React = require('react')
const ReactIs = require('react-is')
// @ts-ignore remove when typed
const svg = require('property-information/svg')
// @ts-ignore remove when typed
const find = require('property-information/find')
// @ts-ignore remove when typed
const hastToReact = require('property-information/hast-to-react.json')
// @ts-ignore remove when typed
const spaces = require('space-separated-tokens')
// @ts-ignore remove when typed
const commas = require('comma-separated-tokens')
const style = require('style-to-object')

exports.hastToReact = toReact
exports.hastChildrenToReact = childrenToReact

/**
 * @typedef {JSX.IntrinsicElements} IntrinsicElements
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('unist').Position} Position
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast').Comment} Comment
 * @typedef {import('hast').DocType} Doctype
 */

/**
 * @typedef {Object} Info
 * @property {string?} space
 * @property {string?} attribute
 * @property {string?} property
 * @property {boolean} boolean
 * @property {boolean} booleanish
 * @property {boolean} overloadedBoolean
 * @property {boolean} number
 * @property {boolean} commaSeparated
 * @property {boolean} spaceSeparated
 * @property {boolean} commaOrSpaceSeparated
 * @property {boolean} mustUseProperty
 * @property {boolean} defined
 *
 * @typedef {Object} Schema
 * @property {Object.<string, Info>} property
 * @property {Object.<string, string>} normal
 * @property {string?} space
 *
 * @typedef {Object} Raw
 * @property {'raw'} type
 * @property {string} value
 *
 * @typedef {Object} Context
 * @property {TransformOptions} options
 * @property {Schema} schema
 * @property {number} listDepth
 *
 * @callback TransformLink
 * @param {string} href
 * @param {Array.<Comment|Element|Text>} children
 * @param {string?} title
 * @returns {string}
 *
 * @callback TransformImage
 * @param {string} src
 * @param {string} alt
 * @param {string?} title
 * @returns {string}
 *
 * @callback TransformLinkTarget
 * @param {string} href
 * @param {Array.<Comment|Element|Text>} children
 * @param {string?} title
 * @returns {string}
 *
 * @typedef {keyof IntrinsicElements} ReactMarkdownNames
 *
 * @typedef {{ [key: string]: unknown, className?: string }} ReactBaseProps
 *
 * To do: is `data-sourcepos` typeable?
 *
 * @typedef {Object} ReactMarkdownProps
 * @property {Element} node
 * @property {string} key
 * @property {ReactNode[]} children
 * @property {Position?} [sourcePosition] Passed when `options.rawSourcePos` is given
 * @property {number} [index] Passed when `options.includeElementIndex` is given
 * @property {number} [siblingCount] Passed when `options.includeElementIndex` is given
 *
 * @callback NormalComponent
 * @param {ReactBaseProps & ReactMarkdownProps} props
 * @returns {ReactNode}
 *
 * @callback CodeComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {inline?: boolean}} props
 * @returns {ReactNode}
 *
 * @callback HeadingComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {level: number}} props
 * @returns {ReactNode}
 *
 * @callback LiComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {checked: boolean|null, index: number, ordered: boolean}} props
 * @returns {ReactNode}
 *
 * @callback OrderedListComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {depth: number, ordered: true}} props
 * @returns {ReactNode}
 *
 * @callback TableCellComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {style?: Object.<string, unknown>, isHeader: boolean}} props
 * @returns {ReactNode}
 *
 * @callback TableRowComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {isHeader: boolean}} props
 * @returns {ReactNode}
 *
 * @callback UnorderedListComponent
 * @param {ReactBaseProps & ReactMarkdownProps & {depth: number, ordered: false}} props
 * @returns {ReactNode}
 *
 * @typedef {Object} SpecialComponents
 * @property {CodeComponent|ReactMarkdownNames} code
 * @property {HeadingComponent|ReactMarkdownNames} h1
 * @property {HeadingComponent|ReactMarkdownNames} h2
 * @property {HeadingComponent|ReactMarkdownNames} h3
 * @property {HeadingComponent|ReactMarkdownNames} h4
 * @property {HeadingComponent|ReactMarkdownNames} h5
 * @property {HeadingComponent|ReactMarkdownNames} h6
 * @property {LiComponent|ReactMarkdownNames} li
 * @property {OrderedListComponent|ReactMarkdownNames} ol
 * @property {TableCellComponent|ReactMarkdownNames} td
 * @property {TableCellComponent|ReactMarkdownNames} th
 * @property {TableRowComponent|ReactMarkdownNames} tr
 * @property {UnorderedListComponent|ReactMarkdownNames} ul
 *
 * @typedef {Record<Exclude<ReactMarkdownNames, keyof SpecialComponents>, NormalComponent|ReactMarkdownNames>} NormalComponents
 * @typedef {Partial<NormalComponents & SpecialComponents>} Components
 */

/**
 * @typedef {Object} TransformOptions
 * @property {boolean} [sourcePos=false]
 * @property {boolean} [rawSourcePos=false]
 * @property {boolean} [skipHtml=false]
 * @property {boolean} [includeElementIndex=false]
 * @property {false|TransformLink} [transformLinkUri]
 * @property {TransformImage} [transformImageUri]
 * @property {string|TransformLinkTarget} [linkTarget]
 * @property {Components} [components]
 */

const own = {}.hasOwnProperty

// The table-related elements that must not contain whitespace text according
// to React.
const tableElements = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])

/**
 * @param {Context} context
 * @param {Element|Root} node
 */
function childrenToReact(context, node) {
  /** @type {Array.<ReactNode>} */
  const children = []
  let childIndex = -1
  /** @type {Comment|Doctype|Element|Raw|Text} */
  let child

  while (++childIndex < node.children.length) {
    child = node.children[childIndex]

    if (child.type === 'element') {
      children.push(toReact(context, child, childIndex, node))
    } else if (child.type === 'text') {
      // React does not permit whitespace text elements as children of table:
      // cf. https://github.com/remarkjs/react-markdown/issues/576
      if (
        node.type !== 'element' ||
        !tableElements.has(node.tagName) ||
        child.value !== '\n'
      ) {
        children.push(child.value)
      }
    }
    // @ts-ignore `raw` nodes are non-standard
    else if (child.type === 'raw' && !context.options.skipHtml) {
      // Default behavior is to show (encoded) HTML.
      // @ts-ignore `raw` nodes are non-standard
      children.push(child.value)
    }
  }

  return children
}

/**
 * @param {Context} context
 * @param {Element} node
 * @param {number} index
 * @param {Element|Root} parent
 */
function toReact(context, node, index, parent) {
  const options = context.options
  const parentSchema = context.schema
  /** @type {ReactMarkdownNames} */
  // @ts-ignore assume a known HTML/SVG element.
  const name = node.tagName
  /** @type {Object.<string, unknown>} */
  const properties = {}
  let schema = parentSchema
  /** @type {string} */
  let property

  if (parentSchema.space === 'html' && name === 'svg') {
    schema = svg
    context.schema = schema
  }

  for (property in node.properties) {
    /* istanbul ignore else - prototype polution. */
    if (own.call(node.properties, property)) {
      addProperty(properties, property, node.properties[property], context)
    }
  }

  if (name === 'ol' || name === 'ul') {
    context.listDepth++
  }

  const children = childrenToReact(context, node)

  if (name === 'ol' || name === 'ul') {
    context.listDepth--
  }

  // Restore parent schema.
  context.schema = parentSchema

  // Nodes created by plugins do not have positional info, in which case we use
  // an object that matches the positon interface.
  const position = node.position || {
    start: {line: null, column: null, offset: null},
    end: {line: null, column: null, offset: null}
  }
  /** @type {NormalComponent|SpecialComponents[keyof SpecialComponents]|ReactMarkdownNames} */
  const component =
    options.components && own.call(options.components, name)
      ? options.components[name]
      : name
  const basic = typeof component === 'string' || component === React.Fragment

  if (!ReactIs.isValidElementType(component)) {
    throw new TypeError(
      `Component for name \`${name}\` not defined or is not renderable`
    )
  }

  properties.key = [
    name,
    position.start.line,
    position.start.column,
    index
  ].join('-')

  if (name === 'a' && options.linkTarget) {
    properties.target =
      typeof options.linkTarget === 'function'
        ? // @ts-ignore assume `href` is a string
          options.linkTarget(properties.href, node.children, properties.title)
        : options.linkTarget
  }

  if (name === 'a' && options.transformLinkUri) {
    properties.href = options.transformLinkUri(
      // @ts-ignore assume `href` is a string
      properties.href,
      node.children,
      properties.title
    )
  }

  if (!basic && name === 'code' && parent.tagName !== 'pre') {
    properties.inline = true
  }

  if (
    !basic &&
    (name === 'h1' ||
      name === 'h2' ||
      name === 'h3' ||
      name === 'h4' ||
      name === 'h5' ||
      name === 'h6')
  ) {
    properties.level = parseInt(name.charAt(1), 10)
  }

  if (name === 'img' && options.transformImageUri) {
    properties.src = options.transformImageUri(
      // @ts-ignore assume `src` is a string
      properties.src,
      properties.alt,
      properties.title
    )
  }

  if (!basic && name === 'li') {
    const input = getInputElement(node)
    properties.checked = input ? Boolean(input.properties.checked) : null
    properties.index = getElementsBeforeCount(parent, node)
    properties.ordered = parent.tagName === 'ol'
  }

  if (!basic && (name === 'ol' || name === 'ul')) {
    properties.ordered = name === 'ol'
    properties.depth = context.listDepth
  }

  if (name === 'td' || name === 'th') {
    if (properties.align) {
      if (!properties.style) properties.style = {}
      // @ts-ignore assume `style` is an object
      properties.style.textAlign = properties.align
      delete properties.align
    }

    if (!basic) {
      properties.isHeader = name === 'th'
    }
  }

  if (!basic && name === 'tr') {
    properties.isHeader = Boolean(parent.tagName === 'thead')
  }

  // If `sourcePos` is given, pass source information (line/column info from markdown source).
  if (options.sourcePos) {
    properties['data-sourcepos'] = flattenPosition(position)
  }

  if (!basic && options.rawSourcePos) {
    properties.sourcePosition = node.position
  }

  // If `includeElementIndex` is given, pass node index info to components.
  if (!basic && options.includeElementIndex) {
    properties.index = getElementsBeforeCount(parent, node)
    properties.siblingCount = getElementsBeforeCount(parent)
  }

  if (!basic) {
    properties.node = node
  }

  // Ensure no React warnings are emitted for void elements w/ children.
  return children.length > 0
    ? React.createElement(component, properties, children)
    : React.createElement(component, properties)
}

/**
 * @param {Element|Root} node
 * @returns {Element?}
 */
function getInputElement(node) {
  let index = -1

  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'element' && child.tagName === 'input') {
      return child
    }
  }

  return null
}

/**
 * @param {Element|Root} parent
 * @param {Element} [node]
 * @returns {number}
 */
function getElementsBeforeCount(parent, node) {
  let index = -1
  let count = 0

  while (++index < parent.children.length) {
    if (parent.children[index] === node) break
    if (parent.children[index].type === 'element') count++
  }

  return count
}

/**
 * @param {Object.<string, unknown>} props
 * @param {string} prop
 * @param {unknown} value
 * @param {Context} ctx
 */
function addProperty(props, prop, value, ctx) {
  /** @type {Info} */
  const info = find(ctx.schema, prop)
  let result = value

  // Ignore nullish and `NaN` values.
  // eslint-disable-next-line no-self-compare
  if (result === null || result === undefined || result !== result) {
    return
  }

  // Accept `array`.
  // Most props are space-separated.
  if (result && typeof result === 'object' && 'length' in result) {
    // type-coverage:ignore-next-line remove when typed.
    result = (info.commaSeparated ? commas : spaces).stringify(result)
  }

  if (info.property === 'style' && typeof result === 'string') {
    result = parseStyle(result)
  }

  if (info.space) {
    props[
      own.call(hastToReact, info.property)
        ? hastToReact[info.property]
        : info.property
    ] = result
  } else {
    props[info.attribute] = result
  }
}

/**
 * @param {string} value
 * @returns {Object.<string, string>}
 */
function parseStyle(value) {
  /** @type {Object.<string, string>} */
  const result = {}

  try {
    style(value, iterator)
  } catch (/** @type {Error} */ _) {
    // Silent.
  }

  return result

  /**
   * @param {string} name
   * @param {string} v
   */
  function iterator(name, v) {
    const k = name.slice(0, 4) === '-ms-' ? `ms-${name.slice(4)}` : name
    result[k.replace(/-([a-z])/g, styleReplacer)] = v
  }
}

/**
 * @param {unknown} _
 * @param {string} $1
 */
function styleReplacer(_, $1) {
  return $1.toUpperCase()
}

/**
 * @param {Position} pos
 * @returns {string}
 */
function flattenPosition(pos) {
  return [
    pos.start.line,
    ':',
    pos.start.column,
    '-',
    pos.end.line,
    ':',
    pos.end.column
  ]
    .map((d) => String(d))
    .join('')
}
