'use strict'

const React = require('react')
const xtend = require('xtend')
const ReactIs = require('react-is')

function astToReact(node, options, parent = {}, index = 0) {
  const renderer = options.renderers[node.type]

  // Nodes created by plugins do not have positional info, in which case we set
  // an object that matches the positon interface.
  if (!node.position) {
    node.position = {
      start: {line: null, column: null, offset: null},
      end: {line: null, column: null, offset: null}
    }
  }

  const pos = node.position.start
  const key = [node.type, pos.line, pos.column, index].join('-')

  if (!ReactIs.isValidElementType(renderer)) {
    throw new Error(`Renderer for type \`${node.type}\` not defined or is not renderable`)
  }

  const nodeProps = getNodeProps(node, key, options, renderer, parent, index)

  return React.createElement(
    renderer,
    nodeProps,
    nodeProps.children || resolveChildren() || undefined
  )

  function resolveChildren() {
    return (
      node.children &&
      node.children.map((childNode, i) =>
        astToReact(childNode, options, {node, props: nodeProps}, i)
      )
    )
  }
}

// eslint-disable-next-line max-params, complexity
function getNodeProps(node, key, opts, renderer, parent, index) {
  const props = {key}

  const isSimpleRenderer = typeof renderer === 'string' || renderer === React.Fragment

  // `sourcePos` is true if the user wants source information (line/column info from markdown source)
  if (opts.sourcePos && node.position) {
    props['data-sourcepos'] = flattenPosition(node.position)
  }

  if (opts.rawSourcePos && !isSimpleRenderer) {
    props.sourcePosition = node.position
  }

  // If `includeNodeIndex` is true, pass node index info to all non-tag renderers
  if (opts.includeNodeIndex && parent.node && parent.node.children && !isSimpleRenderer) {
    props.index = parent.node.children.indexOf(node)
    props.parentChildCount = parent.node.children.length
  }

  const ref =
    node.identifier !== null && node.identifier !== undefined
      ? /* istanbul ignore next - plugins could inject an undefined reference. */
        opts.definitions[node.identifier.toUpperCase()] || {}
      : null

  switch (node.type) {
    case 'root':
      assignDefined(props, {className: opts.className})
      break
    case 'text':
      props.nodeKey = key
      props.children = node.value
      break
    case 'heading':
      props.level = node.depth
      break
    case 'list':
      props.start = node.start
      props.ordered = node.ordered
      props.spread = node.spread
      props.depth = node.depth
      break
    case 'listItem':
      props.checked = node.checked
      props.spread = node.spread
      props.ordered = node.ordered
      props.index = node.index
      props.children = getListItemChildren(node, parent).map((childNode, i) => {
        return astToReact(childNode, opts, {node: node, props: props}, i)
      })
      break
    case 'definition':
      assignDefined(props, {identifier: node.identifier, title: node.title, url: node.url})
      break
    case 'code':
      assignDefined(props, {language: node.lang && node.lang.split(/\s/, 1)[0]})
      break
    case 'inlineCode':
      props.children = node.value
      props.inline = true
      break
    case 'link':
      assignDefined(props, {
        title: node.title || undefined,
        target:
          typeof opts.linkTarget === 'function'
            ? opts.linkTarget(node.url, node.children, node.title)
            : opts.linkTarget,
        href: opts.transformLinkUri
          ? opts.transformLinkUri(node.url, node.children, node.title)
          : node.url
      })
      break
    case 'image':
      assignDefined(props, {
        src: opts.transformImageUri
          ? opts.transformImageUri(node.url, node.children, node.title, node.alt)
          : node.url,
        alt: node.alt || '',
        title: node.title || undefined
      })
      break
    case 'linkReference':
      assignDefined(
        props,
        xtend(ref, {
          href: opts.transformLinkUri ? opts.transformLinkUri(ref.href) : ref.href
        })
      )
      break
    case 'imageReference':
      assignDefined(props, {
        src:
          opts.transformImageUri && ref.href
            ? opts.transformImageUri(ref.href, node.children, ref.title, node.alt)
            : ref.href,
        alt: node.alt || '',
        title: ref.title || undefined
      })
      break
    case 'table':
    case 'tableHead':
    case 'tableBody':
      props.columnAlignment = node.align
      break
    case 'tableRow':
      props.isHeader = parent.node.type === 'tableHead'
      props.columnAlignment = parent.props.columnAlignment
      break
    case 'tableCell':
      assignDefined(props, {
        isHeader: parent.props.isHeader,
        align: parent.props.columnAlignment[index]
      })
      break
    case 'virtualHtml':
      props.tag = node.tag
      break
    case 'html':
      // @todo find a better way than this
      props.isBlock = node.position.start.line !== node.position.end.line
      props.allowDangerousHtml = opts.allowDangerousHtml
      props.escapeHtml = opts.escapeHtml
      props.skipHtml = opts.skipHtml
      break
    case 'parsedHtml': {
      let parsedChildren
      if (node.children) {
        parsedChildren = node.children.map((child, i) => astToReact(child, opts, {node, props}, i))
      }
      props.allowDangerousHtml = opts.allowDangerousHtml
      props.escapeHtml = opts.escapeHtml
      props.skipHtml = opts.skipHtml
      props.element = mergeNodeChildren(node, parsedChildren)
      break
    }
    default:
      assignDefined(
        props,
        xtend(node, {
          type: undefined,
          position: undefined,
          children: undefined
        })
      )
  }

  if (!isSimpleRenderer && node.value) {
    props.value = node.value
  }

  if (!isSimpleRenderer) {
    props.node = node
  }

  return props
}

function assignDefined(target, attrs) {
  for (const key in attrs) {
    if (typeof attrs[key] !== 'undefined') {
      target[key] = attrs[key]
    }
  }
}

function mergeNodeChildren(node, parsedChildren) {
  const el = node.element
  if (el === undefined) {
    /* istanbul ignore next - `div` fallback for old React. */
    const Fragment = React.Fragment || 'div'
    return React.createElement(Fragment, null, null)
  }
  if (Array.isArray(el)) {
    /* istanbul ignore next - `div` fallback for old React. */
    const Fragment = React.Fragment || 'div'
    return React.createElement(Fragment, null, el)
  }

  if (el.props.children || parsedChildren) {
    const children = React.Children.toArray(el.props.children).concat(parsedChildren)
    return React.cloneElement(el, null, children)
  }
  return React.cloneElement(el, null)
}

function flattenPosition(pos) {
  return [pos.start.line, ':', pos.start.column, '-', pos.end.line, ':', pos.end.column]
    .map(String)
    .join('')
}

function getListItemChildren(node, parent) {
  /* istanbul ignore next - list items are always in a list, but best to be sure. */
  const loose = parent && parent.node ? listLoose(parent.node) : listItemLoose(node)
  return loose ? node.children : unwrapParagraphs(node)
}

function unwrapParagraphs(node) {
  return node.children.reduce((array, child) => {
    return array.concat(child.type === 'paragraph' ? child.children : [child])
  }, [])
}

function listLoose(node) {
  const children = node.children
  let loose = node.spread
  let index = -1

  while (!loose && ++index < children.length) {
    loose = listItemLoose(children[index])
  }

  return loose
}

function listItemLoose(node) {
  const spread = node.spread
  /* istanbul ignore next - spread is present from remark-parse, but maybe plugins don’t set it. */
  return spread === undefined || spread === null ? node.children.length > 1 : spread
}

module.exports = astToReact
