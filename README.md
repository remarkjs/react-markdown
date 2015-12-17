# react-markdown

Renders Markdown as pure React components.

[![npm version](http://img.shields.io/npm/v/react-markdown.svg?style=flat-square)](http://browsenpm.org/package/react-markdown)[![Build Status](http://img.shields.io/travis/rexxars/react-markdown/master.svg?style=flat-square)](https://travis-ci.org/rexxars/react-markdown)[![Code Climate](http://img.shields.io/codeclimate/github/rexxars/react-markdown.svg?style=flat-square)](https://codeclimate.com/github/rexxars/react-markdown/)

Demo available at http://rexxars.github.io/react-markdown/

## Installing

```
npm install --save react-markdown
```

## Basic usage

```js
var React = require('react');
var ReactDOM = require('react-dom');
var ReactMarkdown = require('react-markdown');

var input = '# This is a header\n\nAnd this is a paragraph';

ReactDOM.render(
    <ReactMarkdown source={input} />,
    document.getElementById('container')
);
```

## Notes

If you either set `escapeHtml` or `skipHtml` to `true`, this component does not use `dangerouslySetInnerHTML` at all.

## Options

* `source` - *string* The Markdown source to parse (**required**)
* `className` - *string* Class name of the container element (default: `''`).
* `containerTagName` - *string* Tag name for the container element, since Markdown can have many root-level elements, the component need to wrap them in something (default: `div`).
* `escapeHtml` - *boolean* Setting to `true` will escape HTML blocks, rendering plain text instead of inserting the blocks as raw HTML (default: `false`).
* `skipHtml` - *boolean* Setting to `true` will skip inlined and blocks of HTML (default: `false`).
* `sourcePos` - *boolean* Setting to `true` will add `data-sourcepos` attributes to all elements, indicating where in the markdown source they were rendered from (default: `false`).
* `softBreak` - *string* Setting to `br` will create `<br>` tags instead of newlines (default: `\n`).
* `allowedTypes` - *array* Defines which types of nodes should be allowed (rendered). (default: all types).
* `disallowedTypes` - *array* Defines which types of nodes should be disallowed (not rendered). (default: none).
* `allowNode` - *function* Function execute if in order to determine if the node should be allowed. Ran prior to checking `allowedTypes`/`disallowedTypes`. Returning a truthy value will allow the node to be included. Note that if this function returns `true` and the type is not in `allowedTypes` (or specified as a `disallowedType`), it won't be included. The function will get a single object argument (`node`), which includes the following properties:
  * `type` - *string* The type of node - same ones accepted in `allowedTypes` and `disallowedTypes`
  * `tag` - *string* The resolved tag name for this node
  * `props` - *object* Properties for this tag
  * `children` - *array* Array of unparsed children

The possible types of elements that can be allowed/disallowed are:

* `Html` - Inline HTML
* `HtmlBlock` - Block of HTML
* `Text` - Text nodes (inside of paragraphs, list items etc)
* `Paragraph` - Paragraph nodes (`<p>`)
* `Header` - Headers (`<h1>`, `<h2>` etc)
* `Softbreak` - Newlines
* `Hardbreak` - Hard line breaks (`<br>`)
* `Link` - Link nodes (`<a>`)
* `Image` - Image nodes (`<img>`)
* `Emph` - Emphasis nodes (`<em>`)
* `Code` - Inline code nodes (`<code>`)
* `CodeBlock` - Blocks of code (`<code>`)
* `BlockQuote` - Block quotes (`<blockquote>`)
* `List` - List nodes (`<ol>`, `<ul>`)
* `Item` - List item nodes (`<li>`)
* `Strong` - Strong/bold nodes (`<strong>`)
* `HorizontalRule` - Horizontal rule nodes (`<hr>`)

Note: Disallowing a node will also prevent the rendering of any children of that node. Eg, disallowing a paragraph will not render it's children text nodes.

## Developing

```bash
git clone git@github.com:rexxars/react-markdown.git
cd react-markdown
npm install
npm test
```

## License

MIT-licensed. See LICENSE.
