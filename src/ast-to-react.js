'use strict'

const React = require('react')
const xtend = require('xtend')

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

  const ref = node.identifier ? opts.definitions[node.identifier] || {} : null

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
      props.children = (props.tight ? unwrapParagraphs(node) : node.children).map((childNode, i) => {
        return astToReact(childNode, opts, { node: node, props: props }, i)
      })
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
        href: opts.transformLinkUri ? opts.transformLinkUri(node.url, node.children, node.title) : node.url
      })
      break
    case 'image':
      assignDefined(props, {
        alt: node.alt || undefined,
        title: node.title || undefined,
        src: opts.transformImageUri ? opts.transformImageUri(node.url, node.children, node.title, node.alt) : node.url
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
    case 'virtualHtml':
      props.tag = node.tag
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

function unwrapParagraphs(node) {
  return node.children.reduce((array, child) => {
    return array.concat(child.type === 'paragraph' ? child.children || [] : [child])
  }, [])
}

module.exports = astToReact
