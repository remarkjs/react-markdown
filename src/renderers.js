/* eslint-disable react/prop-types, react/no-multi-comp */
'use strict'

const React = require('react')

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
  /* istanbul ignore next - a text node w/o a value could be injected by plugins */
  return props.children || ''
}

function Root(props) {
  const {className} = props
  return className
    ? React.createElement('div', {className}, props.children)
    : React.createElement(React.Fragment, {}, props.children)
}

function SimpleRenderer(tag, props) {
  return React.createElement(tag, getCoreProps(props), props.children)
}

function TableCell(props) {
  const style = props.align ? {textAlign: props.align} : undefined
  const coreProps = getCoreProps(props)
  return React.createElement(
    props.isHeader ? 'th' : 'td',
    Object.assign({style}, coreProps),
    props.children
  )
}

function Heading(props) {
  return React.createElement(`h${props.level}`, getCoreProps(props), props.children)
}

function List(props) {
  const attrs = getCoreProps(props)
  if (props.start !== null && props.start !== 1 && props.start !== undefined) {
    attrs.start = props.start.toString()
  }

  return React.createElement(props.ordered ? 'ol' : 'ul', attrs, props.children)
}

function ListItem(props) {
  let checkbox = null
  if (props.checked !== null && props.checked !== undefined) {
    const checked = props.checked
    checkbox = React.createElement('input', {type: 'checkbox', checked, readOnly: true})
  }

  return React.createElement('li', getCoreProps(props), checkbox, props.children)
}

function CodeBlock(props) {
  const className = props.language && `language-${props.language}`
  const code = React.createElement('code', className ? {className: className} : null, props.value)
  return React.createElement('pre', getCoreProps(props), code)
}

function InlineCode(props) {
  return React.createElement('code', getCoreProps(props), props.children)
}

function Html(props) {
  if (props.skipHtml) {
    return null
  }

  if (!props.allowDangerousHtml) {
    return props.value
  }

  // Otherwise, if there still is an `html` node, that means the naive HTML
  // implementation was used, but it couldn’t handle this one.
  return React.createElement(props.isBlock ? 'div' : 'span', {
    dangerouslySetInnerHTML: {__html: props.value}
  })
}

function ParsedHtml(props) {
  /* To do: `React.cloneElement` is slow, is it really needed? */
  return props['data-sourcepos']
    ? React.cloneElement(props.element, {'data-sourcepos': props['data-sourcepos']})
    : props.element
}

function VirtualHtml(props) {
  return React.createElement(props.tag, getCoreProps(props), props.children)
}

function NullRenderer() {
  return null
}

function getCoreProps(props) {
  const source = props['data-sourcepos']
  /* istanbul ignore next - nodes from plugins w/o position */
  return source ? {'data-sourcepos': source} : {}
}
