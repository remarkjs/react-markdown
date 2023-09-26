/// <reference types="mdast-util-to-hast" />

/**
 * @typedef {import('react').ComponentPropsWithoutRef<T>} ComponentPropsWithoutRef<T>
 * @template {import('react').ElementType} T
 */

/**
 * @typedef {import('react').ComponentType<T>} ComponentType<T>
 * @template T
 */

/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Parents} Parents
 * @typedef {import('hast').Root} Root
 *
 * @typedef {import('property-information').Schema} Schema
 *
 * @typedef {import('react').ReactNode} ReactNode
 *
 * @typedef {import('unist').Position} Position
 *
 * @typedef {import('./complex-types.js').ReactMarkdownProps} ReactMarkdownProps
 * @typedef {import('./complex-types.js').NormalComponents} NormalComponents
 * @typedef {import('./react-markdown.js').Options} Options
 */

/**
 * @typedef State
 *   Info passed around.
 * @property {Readonly<Options>} options
 *   Configuration.
 * @property {Schema} schema
 *   Schema.
 * @property {number} listDepth
 *   Depth.
 *
 * @typedef {ComponentPropsWithoutRef<'code'> & ReactMarkdownProps & {inline?: boolean}} CodeProps
 *   Props passed to components for `code`.
 *   to do: always pass `inline`?
 * @typedef {ComponentPropsWithoutRef<'h1'> & ReactMarkdownProps & {level: number}} HeadingProps
 *   Props passed to components for `h1`, `h2`, etc.
 * @typedef {ComponentPropsWithoutRef<'li'> & ReactMarkdownProps & {checked: boolean | null, index: number, ordered: boolean}} LiProps
 *   Props passed to components for `li`.
 *   to do: use `undefined`.
 * @typedef {ComponentPropsWithoutRef<'ol'> & ReactMarkdownProps & {depth: number, ordered: true}} OrderedListProps
 *   Props passed to components for `ol`.
 * @typedef {ComponentPropsWithoutRef<'td'> & ReactMarkdownProps & {isHeader: false}} TableDataCellProps
 *   Props passed to components for `td`.
 * @typedef {ComponentPropsWithoutRef<'th'> & ReactMarkdownProps & {isHeader: true}} TableHeaderCellProps
 *   Props passed to components for `th`.
 * @typedef {ComponentPropsWithoutRef<'tr'> & ReactMarkdownProps & {isHeader: boolean}} TableRowProps
 *   Props passed to components for `tr`.
 * @typedef {ComponentPropsWithoutRef<'ul'> & ReactMarkdownProps & {depth: number, ordered: false}} UnorderedListProps
 *   Props passed to components for `ul`.
 *
 * @typedef SpecialComponents
 * @property {ComponentType<CodeProps> | keyof JSX.IntrinsicElements} code
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h1
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h2
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h3
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h4
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h5
 * @property {ComponentType<HeadingProps> | keyof JSX.IntrinsicElements} h6
 * @property {ComponentType<LiProps> | keyof JSX.IntrinsicElements} li
 * @property {ComponentType<OrderedListProps> | keyof JSX.IntrinsicElements} ol
 * @property {ComponentType<TableDataCellProps> | keyof JSX.IntrinsicElements} td
 * @property {ComponentType<TableHeaderCellProps> | keyof JSX.IntrinsicElements} th
 * @property {ComponentType<TableRowProps> | keyof JSX.IntrinsicElements} tr
 * @property {ComponentType<UnorderedListProps> | keyof JSX.IntrinsicElements} ul
 *
 * @typedef {Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>} Components
 *   Components.
 */

import React from 'react'
import {stringify as commas} from 'comma-separated-tokens'
import {whitespace} from 'hast-util-whitespace'
import {find, hastToReact, svg} from 'property-information'
import {stringify as spaces} from 'space-separated-tokens'
import style from 'style-to-object'
import {stringifyPosition} from 'unist-util-stringify-position'
import {uriTransformer} from './uri-transformer.js'

const own = {}.hasOwnProperty

// The table-related elements that must not contain whitespace text according
// to React.
const tableElements = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])

/**
 * @param {State} state
 *   Info passed around.
 * @param {Readonly<Parents>} node
 *   Node to transform.
 * @returns {Array<ReactNode>}
 *   Nodes.
 */
export function childrenToReact(state, node) {
  /** @type {Array<ReactNode>} */
  const children = []
  let childIndex = -1

  while (++childIndex < node.children.length) {
    const child = node.children[childIndex]

    if (child.type === 'element') {
      children.push(toReact(state, child, childIndex, node))
    } else if (child.type === 'text') {
      // Currently, a warning is triggered by react for *any* white space in
      // tables.
      // So we drop it.
      // See: <https://github.com/facebook/react/pull/7081>.
      // See: <https://github.com/facebook/react/pull/7515>.
      // See: <https://github.com/remarkjs/remark-react/issues/64>.
      // See: <https://github.com/remarkjs/react-markdown/issues/576>.
      if (
        node.type !== 'element' ||
        !tableElements.has(node.tagName) ||
        !whitespace(child)
      ) {
        children.push(child.value)
      }
    } else if (child.type === 'raw' && !state.options.skipHtml) {
      // Default behavior is to show (encoded) HTML.
      children.push(child.value)
    }
  }

  return children
}

/**
 * @param {State} state
 *   Info passed around.
 * @param {Readonly<Element>} node
 *   Node to transform.
 * @param {number} index
 *   Position of `node` in `parent`.
 * @param {Readonly<Parents>} parent
 *   Parent of `node`.
 * @returns {ReactNode}
 *   Node.
 */
function toReact(state, node, index, parent) {
  const options = state.options
  const transform =
    options.transformLinkUri === undefined
      ? uriTransformer
      : options.transformLinkUri
  const parentSchema = state.schema
  // Assume a known HTML/SVG element.
  const name = /** @type {keyof JSX.IntrinsicElements} */ (node.tagName)
  /** @type {Record<string, unknown>} */
  const properties = {}
  let schema = parentSchema
  /** @type {string} */
  let property

  if (parentSchema.space === 'html' && name === 'svg') {
    schema = svg
    state.schema = schema
  }

  if (node.properties) {
    for (property in node.properties) {
      if (own.call(node.properties, property)) {
        addProperty(state, properties, property, node.properties[property])
      }
    }
  }

  if (name === 'ol' || name === 'ul') {
    state.listDepth++
  }

  const children = childrenToReact(state, node)

  if (name === 'ol' || name === 'ul') {
    state.listDepth--
  }

  // Restore parent schema.
  state.schema = parentSchema

  /** @type {ComponentType<any> | string} */
  const component =
    options.components && own.call(options.components, name)
      ? options.components[name] || name
      : name
  const basic = typeof component === 'string' || component === React.Fragment

  if (!basic && typeof component !== 'function') {
    throw new Error(
      'Unexpected value `' +
        component +
        '` for `' +
        name +
        '`, expected component or tag name'
    )
  }

  properties.key = index

  if (name === 'a' && transform) {
    properties.href = transform(
      String(properties.href || ''),
      node.children,
      // To do: pass `undefined`.
      typeof properties.title === 'string' ? properties.title : null
    )
  }

  if (
    !basic &&
    name === 'code' &&
    parent.type === 'element' &&
    parent.tagName !== 'pre'
  ) {
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
    properties.level = Number.parseInt(name.charAt(1), 10)
  }

  if (name === 'img' && options.transformImageUri) {
    properties.src = options.transformImageUri(
      String(properties.src || ''),
      String(properties.alt || ''),
      // To do: pass `undefined`.
      typeof properties.title === 'string' ? properties.title : null
    )
  }

  if (!basic && name === 'li' && parent.type === 'element') {
    const input = getInputElement(node)
    properties.checked =
      // To do: pass `undefined`.
      input ? Boolean(input.properties.checked) : null
    properties.index = getElementsBeforeCount(parent, node)
    properties.ordered = parent.tagName === 'ol'
  }

  if (!basic && (name === 'ol' || name === 'ul')) {
    properties.ordered = name === 'ol'
    properties.depth = state.listDepth
  }

  if (name === 'td' || name === 'th') {
    if (properties.align) {
      let style = /** @type {Record<string, string> | undefined} */ (
        properties.style
      )

      if (!style) {
        style = {}
        properties.style = style
      }

      style.textAlign = String(properties.align)

      delete properties.align
    }

    if (!basic) {
      properties.isHeader = name === 'th'
    }
  }

  if (!basic && name === 'tr' && parent.type === 'element') {
    properties.isHeader = Boolean(parent.tagName === 'thead')
  }

  // If `sourcePos` is given, pass source information (line/column info from markdown source).
  if (options.sourcePos) {
    properties['data-sourcepos'] = stringifyPosition(node)
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
 * @param {Readonly<Parents>} node
 *   Node to check.
 * @returns {Element | undefined}
 *   `input` element, if found.
 */
function getInputElement(node) {
  let index = -1

  while (++index < node.children.length) {
    const child = node.children[index]

    if (child.type === 'element' && child.tagName === 'input') {
      return child
    }
  }
}

/**
 * @param {Readonly<Parents>} parent
 *   Node.
 * @param {Readonly<Element>} [node]
 *   Node in parent (optional).
 * @returns {number}
 *   Siblings before `node`.
 */
function getElementsBeforeCount(parent, node) {
  let index = -1
  let count = 0

  while (++index < parent.children.length) {
    const child = parent.children[index]
    if (child === node) break
    if (child.type === 'element') count++
  }

  return count
}

/**
 * @param {State} state
 *   Info passed around.
 * @param {Record<string, unknown>} props
 *   Properties.
 * @param {string} prop
 *   Property.
 * @param {unknown} value
 *   Value.
 * @returns {undefined}
 *   Nothing.
 */
function addProperty(state, props, prop, value) {
  const info = find(state.schema, prop)
  let result = value

  // Ignore nullish and `NaN` values.
  // eslint-disable-next-line no-self-compare
  if (result === null || result === undefined || result !== result) {
    return
  }

  // Accept `array`.
  // Most props are space-separated.
  if (Array.isArray(result)) {
    result = info.commaSeparated ? commas(result) : spaces(result)
  }

  if (info.property === 'style' && typeof result === 'string') {
    result = parseStyle(result)
  }

  if (info.space && info.property) {
    props[
      own.call(hastToReact, info.property)
        ? hastToReact[info.property]
        : info.property
    ] = result
  } else if (info.attribute) {
    props[info.attribute] = result
  }
}

/**
 * @param {string} value
 *   Style.
 * @returns {Record<string, string>}
 *   Style.
 */
function parseStyle(value) {
  /** @type {Record<string, string>} */
  const result = {}

  try {
    style(value, iterator)
  } catch {
    // Silent.
  }

  return result

  /**
   * @param {string} name
   *   Name.
   * @param {string} v
   *   Value.
   */
  function iterator(name, v) {
    const k = name.slice(0, 4) === '-ms-' ? `ms-${name.slice(4)}` : name
    result[k.replace(/-([a-z])/g, styleReplacer)] = v
  }
}

/**
 * @param {unknown} _
 *   Whole match.
 * @param {string} $1
 *   Letter.
 * @returns {string}
 *   Replacement.
 */
function styleReplacer(_, $1) {
  return $1.toUpperCase()
}
