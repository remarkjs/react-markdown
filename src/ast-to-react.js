'use strict'

const React = require('react')

function astToReact(node, options, parent = {}, index = 0) {
  if (node.type === 'text') {
    return node.value
  }

  const renderer = options.renderers[node.type]
  if (typeof renderer !== 'function' && typeof renderer !== 'string') {
    throw new Error(`Renderer for type \`${node.type}\` not defined or is not renderable`)
  }

  const pos = node.position.start
  const key = [node.type, pos.line, pos.column].join('-')
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

  // `sourcePos` is true if the user wants source information (line/column info from markdown source)
  if (opts.sourcePos && node.position) {
    props['data-sourcepos'] = flattenPosition(node.position)
  }

  const ref = opts.definitions[node.identifier] || {}

  switch (node.type) {
    case 'root':
      assignDefined(props, {className: opts.className})
      break
    case 'heading':
      props.level = node.depth
      break
    case 'list':
      props.start = node.start
      props.ordered = node.ordered
      props.tight = !node.loose
      break
    case 'listItem':
      props.checked = node.checked
      props.tight = !node.loose
      props.children = (props.tight ? unwrapFirstChild(node) : node.children).map((childNode, i) =>
        astToReact(childNode, opts, {node, props}, i)
      )
      break
    case 'definition':
      assignDefined(props, {identifier: node.identifier, title: node.title, url: node.url})
      break
    case 'code':
      assignDefined(props, {language: node.lang})
      break
    case 'inlineCode':
      props.children = node.value
      props.inline = true
      break
    case 'link':
      assignDefined(props, {
        title: node.title || undefined,
        href: opts.transformLinkUri ? opts.transformLinkUri(node.url) : node.url
      })
      break
    case 'image':
      assignDefined(props, {
        alt: node.alt || undefined,
        title: node.title || undefined,
        src: opts.transformImageUri ? opts.transformImageUri(node.url) : node.url
      })
      break
    case 'linkReference':
      assignDefined(props, opts.definitions[node.identifier] || {})
      break
    case 'imageReference':
      assignDefined(props, {
        src: ref.href,
        title: ref.title || undefined,
        alt: node.alt || undefined
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
    case 'html':
      // @todo find a better way than this
      props.isBlock = node.position.start.line !== node.position.end.line
      props.escapeHtml = opts.escapeHtml
      props.skipHtml = opts.skipHtml
      break
    default:
  }

  if (typeof renderer !== 'string' && node.value) {
    props.value = node.value
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

function flattenPosition(pos) {
  return [pos.start.line, ':', pos.start.column, '-', pos.end.line, ':', pos.end.column]
    .map(String)
    .join('')
}

function unwrapFirstChild(node) {
  return (node.children && node.children[0] && node.children[0].children) || []
}

module.exports = astToReact
