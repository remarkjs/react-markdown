# react-markdown

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Markdown component for React using [**remark**][remark].

[Learn markdown here][learn] and [check out the demo here][demo].

## Install

[npm][]:

```sh
npm install react-markdown
```

## Why this one?

There are other ways for markdown in React out there so why use this one?
The two main reasons are that they often rely on `dangerouslySetInnerHTML` or
have bugs with how they handle markdown.
`react-markdown` uses a syntax tree to build the virtual dom which allows for
updating only the changing DOM instead of completely overwriting.
`react-markdown` is 100% CommonMark (optionally GFM) compliant and has
extensions to support custom syntax.

## Use

A basic hello world:

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import {render} from 'react-dom'

render(<ReactMarkdown># Hello, *world*!</ReactMarkdown>, document.body)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<h1>
  Hello, <em>world</em>!
</h1>
```

</details>

Here is an example using `require`s, passing the markdown as a string, and how
to use a plugin ([`remark-gfm`][gfm], which adds support for strikethrough,
tables, tasklists and URLs directly):

```jsx
const React = require('react')
const ReactMarkdown = require('react-markdown')
const render = require('react-dom').render
const gfm = require('remark-gfm')

const markdown = `Just a link: https://reactjs.com.`

render(<ReactMarkdown remarkPlugins={[gfm]} children={markdown} />, document.body)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<p>
  Just a link: <a href="https://reactjs.com">https://reactjs.com</a>.
</p>
```

</details>

## API

### `props`

*   `children` (`string`, default: `''`)\
    Markdown to parse
*   `className` (`string?`)\
    Wrap the markdown in a `div` with this class name
*   `skipHtml` (`boolean`, default: `false`)\
    Ignore HTML in Markdown completely
*   `sourcePos` (`boolean`, default: `false`)\
    Pass a prop to all components with a serialized position
    (`data-sourcepos="3:1-3:13"`)
*   `rawSourcePos` (`boolean`, default: `false`)\
    Pass a prop to all components with their [position][]
    (`sourcePosition: {start: {line: 3, column: 1}, end:…}`)
*   `includeElementIndex` (`boolean`, default: `false`)\
    Pass the `index` (number of elements before it) and `siblingCount` (number
    of elements in parent) as props to all components
*   `allowedElements` (`Array.<string>`, default: `undefined`)\
    Tag names to allow (can’t combine w/ `disallowedElements`).
    By default all elements are allowed
*   `disallowedElements` (`Array.<string>`, default: `undefined`)\
    Tag names to disallow (can’t combine w/ `allowedElements`).
    By default no elements are disallowed
*   `allowElement` (`(element, index, parent) => boolean?`, optional)\
    Function called to check if an element is allowed (when truthy) or not.
    `allowedElements` / `disallowedElements` is used first!
*   `unwrapDisallowed` (`boolean`, default: `false`)\
    Extract (unwrap) the children of not allowed elements.
    By default, when `strong` is not allowed, it and it’s children is dropped,
    but with `unwrapDisallowed` the element itself is dropped but the children
    used
*   `linkTarget` (`string` or `(href, children, title) => string`, optional)\
    Target to use on links (such as `_blank` for `<a target="_blank"…`)
*   `transformLinkUri` (`(href, children, title) => string`, default:
    [`./uri-transformer.js`][uri], optional)\
    URL to use for links.
    The default allows only `http`, `https`, `mailto`, and `tel`, and is
    available at `ReactMarkdown.uriTransformer`.
    Pass `null` to allow all URLs.
    See [security][]
*   `transformImageUri` (`(src, alt, title) => string`, default:
    [`./uri-transformer.js`][uri], optional)\
    Same as `transformLinkUri` but for images
*   `components` (`Object.<string, Component>`, default: `{}`)\
    Object mapping tag names to React components
*   `remarkPlugins` (`Array.<Plugin>`, default: `[]`)\
    List of [remark plugins][remark-plugins] to use.
    See the next section for examples on how to pass options
*   `rehypePlugins` (`Array.<Plugin>`, default: `[]`)\
    List of [rehype plugins][rehype-plugins] to use.
    See the next section for examples on how to pass options

## Examples

### Use a plugin

This example shows how to use a remark plugin.
In this case, [`remark-gfm`][gfm], which adds support for
strikethrough, tables, tasklists and URLs directly:

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import {render} from 'react-dom'
import gfm from 'remark-gfm'

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`

render(<ReactMarkdown remarkPlugins={[gfm]} children={markdown} />, document.body)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<>
  <p>
    A paragraph with <em>emphasis</em> and <strong>strong importance</strong>.
  </p>
  <blockquote>
    <p>
      A block quote with <del>strikethrough</del> and a URL:{' '}
      <a href="https://reactjs.org">https://reactjs.org</a>.
    </p>
  </blockquote>
  <ul>
    <li>Lists</li>
    <li>
      <input checked={false} readOnly={true} type="checkbox" /> todo
    </li>
    <li>
      <input checked={true} readOnly={true} type="checkbox" /> done
    </li>
  </ul>
  <p>A table:</p>
  <table>
    <thead>
      <tr>
        <td>a</td>
        <td>b</td>
      </tr>
    </thead>
  </table>
</>
```

</details>

### Use a plugin with options

This example shows how to use a plugin and give it options.
To do that, use an array with the plugin at the first place, and the options
second.
[`remark-gfm`][gfm] has an option to allow only double tildes for strikethrough:

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import {render} from 'react-dom'
import gfm from 'remark-gfm'

render(
  <ReactMarkdown remarkPlugins={[[gfm, {singleTilde: false}]]}>
    This ~is not~ strikethrough, but ~~this is~~!
  </ReactMarkdown>,
  document.body
)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<p>
  This ~is not~ strikethrough, but <del>this is</del>!
</p>
```

</details>

### Use custom components (syntax highlight)

This example shows how you can overwrite the normal handling of an element by
passing a component.
In this case, we apply syntax highlighting with the seriously super amazing
[`react-syntax-highlighter`][react-syntax-highlighter] by
[**@conorhastings**][conor]:

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
/* Use `…/dist/cjs/…` if you’re not in ESM! */
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {render} from 'react-dom'

const components = {
  code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <SyntaxHighlighter style={dark} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }
}

// Did you know you can use tildes instead of backticks for code in markdown? ✨
const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`

render(<ReactMarkdown components={components} children={markdown} />, document.body)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<>
  <p>Here is some JavaScript code:</p>
  <pre>
    <SyntaxHighlighter language="js" style={dark} PreTag="div" children="console.log('It works!')" />
  </pre>
</>
```

</details>

### Use remark and rehype plugins (math)

This example shows how a syntax extension (through [`remark-math`][math])
is used to support math in markdown, and a transform plugin
([`rehype-katex`][katex]) to render that math.

```jsx
import React from 'react'
import {render} from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

render(
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    children={`The lift coefficient ($C_L$) is a dimensionless coefficient.`}
  />,
  document.body
)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<p>
  The lift coefficient (
  <span className="math math-inline">
    <span className="katex">
      <span className="katex-mathml">
        <math xmlns="http://www.w3.org/1998/Math/MathML">{/* … */}</math>
      </span>
      <span className="katex-html" aria-hidden="true">
        {/* … */}
      </span>
    </span>
  </span>
  ) is a dimensionless coefficient.
</p>
```

</details>

## Architecture

```txt
                                                           react-markdown
+-------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                                           |
|            +----------+        +----------------+        +---------------+       +----------------+       +------------+                  |
|            |          |        |                |        |               |       |                |       |            |                  |
| -markdown->+  remark  +-mdast->+ remark plugins +-mdast->+ remark-rehype +-hast->+ rehype plugins +-hast->+ components +-react elements-> |
|            |          |        |                |        |               |       |                |       |            |                  |
|            +----------+        +----------------+        +---------------+       +----------------+       +------------+                  |
|                                                                                                                                           |
+-------------------------------------------------------------------------------------------------------------------------------------------+
```

relevant links: [markdown](https://commonmark.org), [remark](https://github.com/remarkjs/remark), [mdast](https://github.com/syntax-tree/mdast), [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md), [remark-rehype](https://github.com/remarkjs/remark-rehype), [hast](https://github.com/syntax-tree/hast), [rehype plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md), [components](#appendix-b-components)

To understand what this project does, it’s very important to first understand
what unified does: please read through the [`unifiedjs/unified`](https://github.com/unifiedjs/unified)
readme (the part until you hit the API section is required reading).

react-markdown is a unified pipeline — wrapped so that most folks don’t need to
directly interact with unified.  The processor goes through these steps:

*   Parse Markdown to mdast (markdown syntax tree)
*   Transform through remark (markdown ecosystem)
*   Transform mdast to hast (HTML syntax tree)
*   Transform through rehype (HTML ecosystem)
*   Render hast to react with components

## Appendix A: HTML in markdown

`react-markdown` typically escapes HTML (or ignores it, with `skipHtml`)
because it is dangerous and defeats the purpose of this library.

However, if you are in a trusted environment (you trust the markdown), and
can spare the bundle size (±60kb minzipped), then you can use
[`rehype-raw`][raw]:

```jsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import {render} from 'react-dom'

const input = `<div class="note">

Some *emphasis* and <strong>strong</strong>!

</div>`

render(<ReactMarkdown rehypePlugins={[rehypeRaw]} children={input} />, document.body)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<div class="note">
  <p>Some <em>emphasis</em> and <strong>strong</strong>!</p>
</div>
```

</details>

**Note**: HTML in markdown is still bound by how [HTML works in
CommonMark][cm-html].
Make sure to use blank lines around block-level HTML that again contains
markdown!

## Appendix B: Components

You can also change the things that come from markdown:

```js
<Markdown
  components={{
    // Map `h1` (`# heading`) to use `h2`s.
    h1: 'h2',
    // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
    em: ({node, ...props}) => <i style={{color: 'red'}} {...props} />
  }}
/>
```

The keys in components are HTML equivalents for the things you write with
markdown (such as `h1` for `# heading`)**†**

**†** Normally, in markdown, those are: `a`, `blockquote`, `code`, `em`, `h1`,
`h2`, `h3`, `h4`, `h5`, `h6`, `hr`, `img`, `li`, `ol`, `p`, `pre`, `strong`, and
`ul`.
With [`remark-gfm`][gfm], you can also use: `del`, `input`, `table`, `tbody`,
`td`, `th`, `thead`, and `tr`.
Other remark or rehype plugins that add support for new constructs will also
work with `react-markdown`.

The props that are passed are what you probably would expect: an `a` (link) will
get `href` (and `title`) props, and `img` (image) an `src` (and `title`), etc.
There are some extra props passed.

*   `code`
    *   `inline` (`boolean?`)
        — set to `true` for inline code
    *   `className` (`string?`)
        — set to `language-js` or so when using ` ```js `
*   `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
    *   `level` (`number` beween 1 and 6)
        — heading rank
*   `input` (when using [`remark-gfm`][gfm])
    *   `checked` (`boolean`)
        — whether the item is checked
    *   `disabled` (`true`)
    *   `type` (`'checkbox'`)
*   `li`
    *   `index` (`number`)
        — number of preceding items (so first gets `0`, etc.)
    *   `ordered` (`boolean`)
        — whether the parent is an `ol` or not
    *   `checked` (`boolean?`)
        — `null` normally, `boolean` when using [`remark-gfm`][gfm]’s tasklists
    *   `className` (`string?`)
        — set to `task-list-item` when using [`remark-gfm`][gfm] and the
        item1 is a tasklist
*   `ol`, `ul`
    *   `depth` (`number`)
        — number of ancestral lists (so first gets `0`, etc.)
    *   `ordered` (`boolean`)
        — whether it’s an `ol` or not
    *   `className` (`string?`)
        — set to `contains-task-list` when using [`remark-gfm`][gfm] and the
        list contains one or more tasklists
*   `td`, `th` (when using [`remark-gfm`][gfm])
    *   `style` (`Object?`)
        — something like `{textAlign: 'left'}` depending on how the cell is
        aligned
    *   `isHeader` (`boolean`)
        — whether it’s a `th` or not
*   `tr` (when using [`remark-gfm`][gfm])
    *   `isHeader` (`boolean`)
        — whether it’s in the `thead` or not

Every component will receive a `node` (`Object`).
This is the original [hast](https://github.com/syntax-tree/hast) element being
turned into a React element.

Every element will receive a `key` (`string`).
See [React’s docs](https://reactjs.org/docs/lists-and-keys.html#keys) for more
info.

Optionally, components will also receive:

*   `data-sourcepos` (`string`)
    — see `sourcePos` option
*   `sourcePosition` (`Object`)
    — see `rawSourcePos` option
*   `index` and `siblingCount` (`number`)
    — see `includeElementIndex` option
*   `target` on `a` (`string`)
    — see `linkTarget` option

## Security

Use of `react-markdown` is secure by default.
Overwriting `transformLinkUri` or `transformImageUri` to something insecure will
open you up to XSS vectors.
Furthermore, the `remarkPlugins` and `rehypePlugins` you use and `components`
you write may be insecure.

To make sure the content is completely safe, even after what plugins do,
use [`rehype-sanitize`][sanitize].
That plugin lets you define your own schema of what is and isn’t allowed.

## Related

*   [`MDX`](https://github.com/mdx-js/mdx)
    — JSX *in* markdown
*   [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
    — Plugin for GitHub flavored markdown support

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Espen Hovlandsdal][author]

[build-badge]: https://github.com/remarkjs/react-markdown/workflows/main/badge.svg

[build]: https://github.com/remarkjs/react-markdown/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/react-markdown.svg

[coverage]: https://codecov.io/github/remarkjs/react-markdown

[downloads-badge]: https://img.shields.io/npm/dm/react-markdown.svg

[downloads]: https://www.npmjs.com/package/react-markdown

[size-badge]: https://img.shields.io/bundlephobia/minzip/react-markdown.svg

[size]: https://bundlephobia.com/result?p=react-markdown

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://espen.codes/

[remark]: https://github.com/remarkjs/remark

[demo]: https://remarkjs.github.io/react-markdown/

[learn]: https://commonmark.org/help/

[position]: https://github.com/syntax-tree/unist#position

[gfm]: https://github.com/remarkjs/remark-gfm

[math]: https://github.com/remarkjs/remark-math

[katex]: https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex

[raw]: https://github.com/rehypejs/rehype-raw

[sanitize]: https://github.com/rehypejs/rehype-sanitize

[remark-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins

[cm-html]: https://spec.commonmark.org/0.29/#html-blocks

[uri]: https://github.com/remarkjs/react-markdown/blob/main/src/uri-transformer.js

[security]: #security

[react-syntax-highlighter]: https://github.com/react-syntax-highlighter/react-syntax-highlighter

[conor]: https://github.com/conorhastings
