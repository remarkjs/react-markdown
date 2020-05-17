# react-remark

[![CI](https://github.com/ChristianMurphy/react-remark/workflows/CI/badge.svg?branch=master)](https://github.com/ChristianMurphy/react-remark/actions?query=workflow%3ACI)

**react-remark** offers a [React hook](https://reactjs.org/docs/hooks-intro.html) and [React component](https://reactjs.org/docs/glossary.html#components) based way of rendering [markdown](https://commonmark.org/) into [React](https://reactjs.org) using [remark](https://github.com/remarkjs/remark)

## Installation

_npm_

```
npm install --save react-markdown
```

_yarn_

```
yarn add react-markdown"
```

## Usage

### As a hook

#### Render static content

```tsx
import React from 'react';
import { useRemark } from 'react-markdown';

const ExampleComponent = () => {
  const [reactContent, setMarkdownSource] = useRemark();

  setMarkdownSource('# markdown header');

  return reactContent;
};

export default ExampleComponent;
```

#### Using input and events to update

```tsx
import React from 'react';
import { useRemark } from 'react-markdown';

const ExampleComponent = () => {
  const [reactContent, setMarkdownSource] = useRemark();

  return (
    <>
      <input
        type="text"
        onChange={({ currentTarget }) => setMarkdownSource(currentTarget.value)}
      />
      {reactContent}
    </>
  );
};

export default ExampleComponent;
```

[More examples of usage as hook in storybook.](https://christianmurphy.github.io/react-remark/?path=/story/remark-hook--default)

### As a component

#### Render static content

```tsx
import React, { useState } from 'react';
import { Remark } from 'react-markdown';

const ExampleComponent = () => (
  <Remark>{`
# header

1. ordered
2. list
`}</Remark>
);

export default ExampleComponent;
```

#### Using input and events to update

```tsx
import React, { useState } from 'react';
import { Remark } from 'react-markdown';

const ExampleComponent = () => {
  const [markdownSource, setMarkdownSource] = useState('');

  return (
    <>
      <input
        type="text"
        onChange={({ currentTarget }) => setMarkdownSource(currentTarget.value)}
      />
      <Remark>{markdownSource}</Remark>
    </>
  );
};

export default ExampleComponent;
```

[More examples of usage as component in storybook.](https://christianmurphy.github.io/react-remark/?path=/story/remark-component--default)

## Examples

A set of runnable examples are provided through storybook at <https://christianmurphy.github.io/react-remark>.
The source for the story files can be found in [_/stories_](./stories).

## Architecture

```
                                                             react-remark
+---------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                             |
|            +----------+        +----------------+        +---------------+       +----------------+       +--------------+                  |
|            |          |        |                |        |               |       |                |       |              |                  |
| -markdown->+  remark  +-mdast->+ remark plugins +-mdast->+ remark-rehype +-hast->+ rehype plugins +-hast->+ rehype-react +-react elements-> |
|            |          |        |                |        |               |       |                |       |              |                  |
|            +----------+        +----------------+        +---------------+       +----------------+       +--------------+                  |
|                                                                                                                                             |
+---------------------------------------------------------------------------------------------------------------------------------------------+
```

## Options

- `remarkParseOptions` (Object) - configure how Markdown is parsed, same as [`remark-parse` options](https://github.com/remarkjs/remark/tree/master/packages/remark-parse#options)
- `remarkPlugins` (Array) - [remark plugins](https://github.com/remarkjs/remark/blob/master/doc/plugins.md) or [custom plugins](https://unifiedjs.com/learn/guide/create-a-plugin) to transform markdown content before it is translated to HTML (hast)
- `remarkToRehypeOptions` (Object) - configure how Markdown (mdast) is translated into HTML (hast), same as [`remark-rehype` options](https://github.com/remarkjs/remark-rehype#api)
- `rehypePlugins` (Array) - [rehype plugins](https://github.com/rehypejs/rehype/blob/master/doc/plugins.md) or [custom plugins](https://unifiedjs.com/learn/guide/create-a-plugin) to transform HTML (hast) before it is translated to React elements.
- `rehypeReactOptions` (Object) - configure how HTML (hast) is translated into React elements, same as [`rehype-react` options](https://github.com/rehypejs/rehype-react#options)

### Pass options to hook

```tsx
import React, { Fragment } from 'react';
import { useRemark } from 'react-markdown';
import remarkGemoji from 'remark-gemoji';
import rehypeAutoLinkHeadings from 'rehype-autolink-headings';

// ...

const [reactContent, setMarkdownSource] = useRemark({
  remarkParseOptions: { commonmark: true },
  remarkPlugins: [remarkGemoji],
  remarkToRehypeOptions: { commonmark: true },
  rehypePlugins: [rehypeAutoLinkHeadings],
  rehypeReactOptions: {
    components: {
      p: props => <p className="custom-paragraph" {...props} />,
    },
  },
});
```

### Pass options to component

```tsx
import React, { Fragment } from 'react';
import { useRemark } from 'react-markdown';
import remarkGemoji from 'remark-gemoji';
import rehypeAutoLinkHeadings from 'rehype-autolink-headings';

// ...

<Remark
  remarkParseOptions={{ commonmark: true }}
  remarkPlugins={[remarkGemoji]}
  remarkToRehypeOptions={{ commonmark: true }}
  rehypePlugins={[rehypeAutoLinkHeadings]}
  rehypeReactOptions={{
    components: {
      p: props => <p className="custom-paragraph" {...props} />,
    },
  }}
>
  {markdownSource}
</Remark>;
```
