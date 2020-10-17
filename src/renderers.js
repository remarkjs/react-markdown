/* eslint-disable react/prop-types, react/no-multi-comp */
'use strict'

const xtend = require('xtend')
const React = require('react')

/* istanbul ignore next - Don’t crash on old React. */
const supportsStringRender = parseInt((React.version || '16').slice(0, 2), 10) >= 16
const createElement = React.createElement

module.exports = {
  break: 'br',
  paragraph: 'p',
  emphasis: 'em',
  strong: 'strong',
  thematicBreak: 'hr',
  blockquote: 'blockquote',
  delete: 'del',
  link: 'a',
  image: 'img',
  linkReference: 'a',
  imageReference: 'img',
  table: SimpleRenderer.bind(null, 'table'),
  tableHead: SimpleRenderer.bind(null, 'thead'),
  tableBody: SimpleRenderer.bind(null, 'tbody'),
  tableRow: SimpleRenderer.bind(null, 'tr'),
  tableCell: TableCell,

  root: Root,
  text: TextRenderer,
  list: List,
  listItem: ListItem,
  definition: NullRenderer,
  heading: Heading,
  inlineCode: InlineCode,
  code: CodeBlock,
  html: Html,
  virtualHtml: VirtualHtml,
  parsedHtml: ParsedHtml
}

function TextRenderer(props) {
  /* istanbul ignore next - `span` is a fallback for old React. */
  return supportsStringRender ? props.children : createElement('span', null, props.children)
}

function Root(props) {
  const {className} = props
  const root = (!className && React.Fragment) || 'div'
  return createElement(root, className ? {className} : null, props.children)
}

function SimpleRenderer(tag, props) {
  return createElement(tag, getCoreProps(props), props.children)
}

function TableCell(props) {
  const style = props.align ? {textAlign: props.align} : undefined
  const coreProps = getCoreProps(props)
  return createElement(
    props.isHeader ? 'th' : 'td',
    style ? xtend({style}, coreProps) : coreProps,
    props.children
  )
}

function Heading(props) {
  return createElement(`h${props.level}`, getCoreProps(props), props.children)
}

function List(props) {
  const attrs = getCoreProps(props)
  if (props.start !== null && props.start !== 1 && props.start !== undefined) {
    attrs.start = props.start.toString()
  }

  return createElement(props.ordered ? 'ol' : 'ul', attrs, props.children)
}

function ListItem(props) {
  let checkbox = null
  if (props.checked !== null && props.checked !== undefined) {
    const checked = props.checked
    checkbox = createElement('input', {type: 'checkbox', checked, readOnly: true})
  }

  return createElement('li', getCoreProps(props), checkbox, props.children)
}

function CodeBlock(props) {
  const className = props.language && `language-${props.language}`
  const code = createElement('code', className ? {className: className} : null, props.value)
  return createElement('pre', getCoreProps(props), code)
}

function InlineCode(props) {
  return createElement('code', getCoreProps(props), props.children)
}

function Html(props) {
  if (props.skipHtml) {
    return null
  }

  const tag = props.isBlock ? 'div' : 'span'
  if (props.escapeHtml) {
    /* istanbul ignore next - `tag` is a fallback for old React. */
    return createElement(React.Fragment || tag, null, props.value)
  }

  const nodeProps = {dangerouslySetInnerHTML: {__html: props.value}}
  return createElement(tag, nodeProps)
}

function ParsedHtml(props) {
  /* To do: `React.cloneElement` is slow, is it really needed? */
  return props['data-sourcepos']
    ? React.cloneElement(props.element, {'data-sourcepos': props['data-sourcepos']})
    : props.element
}

function VirtualHtml(props) {
  return createElement(props.tag, getCoreProps(props), props.children)
}

function NullRenderer() {
  return null
}

function getCoreProps(props) {
  const source = props['data-sourcepos']
  /* istanbul ignore next - nodes from plugins w/o position */
  return source ? {'data-sourcepos': source} : {}
}
