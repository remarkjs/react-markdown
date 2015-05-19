# react-markdown

Renders Markdown as React components.

## Installing

```
npm install --save react-markdown
```

## Basic usage

```js
var React = require('react');
var ReactMarkdown = require('react-markdown');

React.render(
    <ReactMarkdown />,
    document.getElementById('container')
);
```

## Testing

```bash
git clone git@github.com:rexxars/react-markdown.git && cd react-markdown
npm install
npm test
```