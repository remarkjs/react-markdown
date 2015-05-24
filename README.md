# react-markdown

Renders Markdown as pure React components.

[![npm version](http://img.shields.io/npm/v/react-markdown.svg?style=flat-square)](http://browsenpm.org/package/react-markdown)[![Build Status](http://img.shields.io/travis/rexxars/react-markdown/master.svg?style=flat-square)](https://travis-ci.org/rexxars/react-markdown)[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/rexxars/react-markdown.svg?style=flat-square)](https://codeclimate.com/github/rexxars/react-markdown)[![Code Climate](http://img.shields.io/codeclimate/github/rexxars/react-markdown.svg?style=flat-square)](https://codeclimate.com/github/rexxars/react-markdown/)

Demo available at http://rexxars.github.io/react-markdown/

## Installing

```
npm install --save react-markdown
```

## Basic usage

```js
var React = require('react');
var ReactMarkdown = require('react-markdown');

var input = '# This is a header\n\nAnd this is a paragraph';

React.render(
    <ReactMarkdown source={input} />,
    document.getElementById('container')
);
```

## Notes

If you either set `escapeHtml` or `skipHtml` to `true`, this component does not use `dangerouslySetInnerHTML` at all.

## Options

* `source` - *string* The Markdown source to parse (**required**)
* `containerTagName` - *string* Tag name for the container element, since Markdown can have many root-level elements, the component need to wrap them in something (default: `div`).
* `escapeHtml` - *boolean* Setting to `true` will escape HTML blocks, rendering plain text instead of inserting the blocks as raw HTML (default: `false`).
* `skipHtml` - *boolean* Setting to `true` will skip inlined and blocks of HTML (default: `false`).
* `sourcePos` - *boolean* Setting to `true` will add `data-sourcepos` attributes to all elements, indicating where in the markdown source they were rendered from (default: `false`).
* `softBreak` - *string* Setting to `br` will create `<br>` tags instead of newlines (default: `\n`).

## Testing

```bash
git clone git@github.com:rexxars/react-markdown.git
cd react-markdown
npm install
npm test
```
