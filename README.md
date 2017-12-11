# react-markdown

Renders Markdown as pure React components.

[![npm version](https://img.shields.io/npm/v/react-markdown.svg?style=flat-square)](http://browsenpm.org/package/react-markdown)[![Build Status](https://img.shields.io/travis/rexxars/react-markdown/master.svg?style=flat-square)](https://travis-ci.org/rexxars/react-markdown)[![Code Climate](https://img.shields.io/codeclimate/github/rexxars/react-markdown.svg?style=flat-square)](https://codeclimate.com/github/rexxars/react-markdown/)

Demo available at http://rexxars.github.io/react-markdown/

---

react-markdown is proudly sponsored by

<a href="https://www.sanity.io/" rel="nofollow" target="_blank">
  <img src="https://www.sanity.io/static/images/logo_red.svg?v=2" width="300"><br />
  Sanity: The Headless CMS Construction Kit
</a>

---

## Installing

```
npm install --save react-markdown
```

## Basic usage

```js
const React = require('react')
const ReactDOM = require('react-dom')
const ReactMarkdown = require('react-markdown')

const input = '# This is a header\n\nAnd this is a paragraph'

ReactDOM.render(
  <ReactMarkdown source={input} />,
  document.getElementById('container')
)
```

## Notes

If you don't need to render HTML, this component does not use `dangerouslySetInnerHTML` at all -
this is a Good Thing™.

## Inline HTML is broken

Inline HTML is currently broken for any tags that include attributes. A vague idea of how to fix
this has been planned, but if you're feeling up to the task, create an issue and let us know!

## Options

* `source` - _string_ The Markdown source to parse (**required**)
* `className` - _string_ Class name of the container element (default: `''`).
* `escapeHtml` - _boolean_ Setting to `false` will cause HTML to be rendered (see note above about
  broken HTML, though). Be aware that setting this to `false` might cause security issues if the
  input is user-generated. Use at your own risk. (default: `true`).
* `skipHtml` - _boolean_ Setting to `true` will skip inlined and blocks of HTML (default: `false`).
* `sourcePos` - _boolean_ Setting to `true` will add `data-sourcepos` attributes to all elements,
  indicating where in the markdown source they were rendered from (default: `false`).
* `allowedTypes` - _array_ Defines which types of nodes should be allowed (rendered). (default: all
  types).
* `disallowedTypes` - _array_ Defines which types of nodes should be disallowed (not rendered).
  (default: none).
* `unwrapDisallowed` - _boolean_ Setting to `true` will try to extract/unwrap the children of
  disallowed nodes. For instance, if disallowing `Strong`, the default behaviour is to simply skip
  the text within the strong altogether, while the behaviour some might want is to simply have the
  text returned without the strong wrapping it. (default: `false`)
* `allowNode` - _function_ Function execute if in order to determine if the node should be allowed.
  Ran prior to checking `allowedTypes`/`disallowedTypes`. Returning a truthy value will allow the
  node to be included. Note that if this function returns `true` and the type is not in
  `allowedTypes` (or specified as a `disallowedType`), it won't be included. The function will
  receive three arguments argument (`node`, `index`, `parent`), where `node` contains different
  properties depending on the node type.
* `transformLinkUri` - _function|null_ Function that gets called for each encountered link with a
  single argument - `uri`. The returned value is used in place of the original. The default link URI
  transformer acts as an XSS-filter, neutralizing things like `javascript:`, `vbscript:` and `file:`
  protocols. If you specify a custom function, this default filter won't be called, but you can
  access it as `require('react-markdown').uriTransformer`. If you want to disable the default
  transformer, pass `null` to this option.
* `transformImageUri` - _function|null_ Function that gets called for each encountered image with a
  single argument - `uri`. The returned value is used in place of the original.
* `renderers` - _object_ An object where the keys represent the node type and the value is a React
  component. The object is merged with the default renderers. The props passed to the component
  consties based on the type of node.

## Node types

The node types available are the following, and applies to both `renderers` and
`allowedTypes`/`disallowedTypes`:

* `root` - Root container element that contains the rendered markdown
* `break` - Hard-break (`<br>`)
* `paragraph` - Paragraph (`<p>`)
* `emphasis` - Emphasis (`<em>`)
* `strong` - Strong/bold (`<strong>`)
* `thematicBreak` - Horizontal rule / thematic break (`<hr>`)
* `blockquote` - Block quote (`<blockquote>`)
* `delete` - Deleted/strike-through (`<del>`)
* `link` - Link (`<a>`)
* `image` - Image (`<img>`)
* `linkReference` - Link (through a reference) (`<a>`)
* `imageReference` - Image (through a reference) (`<img>`)
* `table` - Table (`<table>`)
* `tableHead` - Table head (`<thead>`)
* `tableBody` - Table body (`<tbody>`)
* `tableRow` - Table row (`<tr>`)
* `tableCell` - Table cell (`<td>`/`<th>`)
* `list` - List (`<ul>`/`<ol>`)
* `listItem` - List item (`<li>`)
* `definition` - Definition (not rendered by default)
* `heading` - Heading (`<h1>`-`<h6>`)
* `inlineCode` - Inline code (`<code>`)
* `code` - Block of code (`<pre><code>`)
* `html` - HTML node (Best-effort rendering)

Note: Disallowing a node will also prevent the rendering of any children of that node, unless the
`unwrapDisallowed` option is set to `true`. Eg, disallowing a paragraph will not render it's
children text nodes.

## Developing

```bash
git clone git@github.com:rexxars/react-markdown.git
cd react-markdown
npm install
npm test
```

## License

MIT-licensed. See LICENSE.
