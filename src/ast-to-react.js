'use strict'

const React = require('react')
const xtend = require('xtend')

function astToReact(node, options, parent = {}, index = 0) {
  const renderer = options.renderers[node.type]

  const pos = node.position.start
  const key = [node.type, pos.line, pos.column].join('-')

  if (node.type === 'text') {
    return renderer ? renderer(node.value, key) : node.value
  }

  if (typeof renderer !== 'function' && typeof renderer !== 'string' && !isReactFragment(renderer)) {
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

function isReactFragment(renderer) {
  return React.Fragment && React.Fragment === renderer;
}

// eslint-disable-next-line max-params, complexity
function getNodeProps(node, key, opts, renderer, parent, index) {
  const props = {key}

  const isTagRenderer = typeof renderer === 'string'

  // `sourcePos` is true if the user wants source information (line/column info from markdown source)
  if (opts.sourcePos && node.position) {
    props['data-sourcepos'] = flattenPosition(node.position)
  }

  if (opts.rawSourcePos && !isTagRenderer) {
    props.sourcePosition = node.position
  }

  // If `includeNodeIndex` is true, pass node index info to all non-tag renderers
  if (opts.includeNodeIndex && parent.node && parent.node.children && !isTagRenderer) {
    props.index = parent.node.children.indexOf(node);
    props.parentChildCount = parent.node.children.length;
  }

  const ref = (node.identifier !== null && node.identifier !== undefined) ? opts.definitions[node.identifier] || {} : null

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
      props.depth = node.depth
      break
    case 'listItem':
      props.checked = node.checked
      props.tight = !node.loose
      props.ordered = node.ordered
      props.index = node.index
      props.children = (props.tight ? unwrapParagraphs(node) : node.children).map((childNode, i) => {
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
        target: typeof opts.linkTarget === 'function' ? opts.linkTarget(node.url, node.children, node.title) : opts.linkTarget,
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
    case 'reactNode':
      props.escapeHtml = opts.escapeHtml
      props.skipHtml = opts.skipHtml
      props.element = mergeNodeChildren(node, (node.children || []).map(
        (child, i) => astToReact(child, opts, {node, props}, i))
      )
      break
    default:
      assignDefined(
        props,
        xtend(node, {
          type: undefined,
          position: undefined,
          children: undefined,
        }),
      )
  }

  if (!isTagRenderer && node.value) {
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

function mergeNodeChildren(reactNode, parsedChildren) {
  const el = reactNode.element
  if (Array.isArray(el)) {
    const Fragment = React.Fragment || 'div'
    return React.createElement(Fragment, null, el)
  }

  const children = (el.props.children || []).concat(parsedChildren)
  return React.cloneElement(el, null, children)
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
