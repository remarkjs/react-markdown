'use strict'

const React = require('react')
const ReactIs = require('react-is')
const convert = require('unist-util-is/convert')
const svg = require('property-information/svg')
const find = require('property-information/find')
const hastToReact = require('property-information/hast-to-react.json')
const spaces = require('space-separated-tokens')
const commas = require('comma-separated-tokens')
const style = require('style-to-object')

exports.hastToReact = toReact
exports.hastChildrenToReact = childrenToReact

const element = convert('element')
const text = convert('text')

const own = {}.hasOwnProperty

function childrenToReact(context, node) {
  const children = []
  let childIndex = -1
  let child

  /* istanbul ignore else - plugins could inject elements w/o children */
  if (node.children) {
    while (++childIndex < node.children.length) {
      child = node.children[childIndex]

      /* istanbul ignore else - plugins could inject comments and such */
      if (element(child)) {
        children.push(toReact(context, child, childIndex, node))
      } else if (text(child)) {
        children.push(child.value)
      } else if (child.type === 'raw') {
        if (context.options.skipHtml) {
          // Empty.
        } else {
          children.push(child.value)
        }
      }
    }
  }

  return children
}

// eslint-disable-next-line complexity, max-statements
function toReact(context, node, index, parent) {
  const options = context.options
  const parentSchema = context.schema
  const name = node.tagName
  const properties = {}
  let schema = parentSchema
  let property

  if (parentSchema.space === 'html' && name === 'svg') {
    schema = svg
    context.schema = schema
  }

  for (property in node.properties) {
    /* istanbul ignore else - prototype polution. */
    if (own.call(node.properties, property)) {
      addProperty(properties, property, node.properties[property], context, name)
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
  const component =
    options.components && own.call(options.components, name) ? options.components[name] : name
  const basic = typeof component === 'string' || component === React.Fragment

  if (!ReactIs.isValidElementType(component)) {
    throw new Error(`Component for name \`${name}\` not defined or is not renderable`)
  }

  properties.key = [name, position.start.line, position.start.column, index].join('-')

  if (name === 'a' && options.linkTarget) {
    properties.target =
      typeof options.linkTarget === 'function'
        ? options.linkTarget(properties.href, node.children, properties.title)
        : options.linkTarget
  }

  if (name === 'a' && options.transformLinkUri) {
    properties.href = options.transformLinkUri(properties.href, node.children, properties.title)
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
    properties.src = options.transformImageUri(properties.src, node.alt, properties.title)
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
      /* istanbul ignore else - plugins adding style. */
      if (!properties.style) properties.style = {}
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
  return children.length
    ? React.createElement(component, properties, children)
    : React.createElement(component, properties)
}

function getInputElement(node) {
  let index = -1

  while (++index < node.children.length) {
    if (element(node.children[index]) && node.children[index].tagName === 'input')
      return node.children[index]
  }

  return null
}

function getElementsBeforeCount(parent, node) {
  let index = -1
  let count = 0

  while (++index < parent.children.length) {
    if (parent.children[index] === node) break
    if (element(parent.children[index])) count++
  }

  return count
}

function addProperty(props, prop, value, ctx, name) {
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
    result = (info.commaSeparated ? commas : spaces).stringify(result)
  }

  if (info.property === 'style' && typeof result === 'string') {
    result = parseStyle(result, name)
  }

  if (info.space) {
    props[hastToReact[info.property] || info.property] = result
  } else {
    props[info.attribute] = result
  }
}

function parseStyle(value, tagName) {
  const result = {}

  try {
    style(value, iterator)
  } catch (error) {
    // Silent.
  }

  return result

  function iterator(name, v) {
    const k = name.slice(0, 4) === '-ms-' ? `ms-${name.slice(4)}` : name
    result[k.replace(/-([a-z])/g, styleReplacer)] = v
  }
}

function styleReplacer($0, $1) {
  return $1.toUpperCase()
}

function flattenPosition(pos) {
  return [pos.start.line, ':', pos.start.column, '-', pos.end.line, ':', pos.end.column]
    .map(String)
    .join('')
}
