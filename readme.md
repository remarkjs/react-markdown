<!--
Notes for maintaining this document:

*   Update the link for `cm-html` once in a while
-->

# react-markdown

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

React component to render markdown.

## Feature highlights

*   [x] **[safe][section-security] by default**
    (no `dangerouslySetInnerHTML` or XSS attacks)
*   [x] **[components][section-components]**
    (pass your own component to use instead of `<h2>` for `## hi`)
*   [x] **[plugins][section-plugins]**
    (many plugins you can pick and choose from)
*   [x] **[compliant][section-syntax]**
    (100% to CommonMark, 100% to GFM with a plugin)

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`Markdown`](#markdown)
    *   [`defaultUrlTransform(url)`](#defaulturltransformurl)
    *   [`AllowElement`](#allowelement)
    *   [`Components`](#components)
    *   [`ExtraProps`](#extraprops)
    *   [`Options`](#options)
    *   [`UrlTransform`](#urltransform)
*   [Examples](#examples)
    *   [Use a plugin](#use-a-plugin)
    *   [Use a plugin with options](#use-a-plugin-with-options)
    *   [Use custom components (syntax highlight)](#use-custom-components-syntax-highlight)
    *   [Use remark and rehype plugins (math)](#use-remark-and-rehype-plugins-math)
*   [Plugins](#plugins)
*   [Syntax](#syntax)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Architecture](#architecture)
*   [Appendix A: HTML in markdown](#appendix-a-html-in-markdown)
*   [Appendix B: Components](#appendix-b-components)
*   [Appendix C: line endings in markdown (and JSX)](#appendix-c-line-endings-in-markdown-and-jsx)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [React][] component that can be given a string of markdown
that it’ll safely render to React elements.
You can pass plugins to change how markdown is transformed and pass components
that will be used instead of normal HTML elements.

*   to learn markdown, see this [cheatsheet and tutorial][commonmark-help]
*   to try out `react-markdown`, see [our demo][demo]

## When should I use this?

There are other ways to use markdown in React out there so why use this one?
The three main reasons are that they often rely on `dangerouslySetInnerHTML`,
have bugs with how they handle markdown, or don’t let you swap elements for
components.
`react-markdown` builds a virtual DOM, so React only replaces what changed,
from a syntax tree.
That’s supported because we use [unified][], specifically [remark][] for
markdown and [rehype][] for HTML, which are popular tools to transform content
with plugins.

This package focusses on making it easy for beginners to safely use markdown in
React.
When you’re familiar with unified, you can use a modern hooks based alternative
[`react-remark`][react-remark] or [`rehype-react`][rehype-react] manually.
If you instead want to use JavaScript and JSX *inside* markdown files, use
[MDX][].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install react-markdown
```

In Deno with [`esm.sh`][esmsh]:

```js
import Markdown from 'https://esm.sh/react-markdown@9'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import Markdown from 'https://esm.sh/react-markdown@9?bundle'
</script>
```

## Use

A basic hello world:

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'

const markdown = '# Hi, *Pluto*!'

function App() {
  return <Markdown>{markdown}</Markdown>
}

createRoot(document.body).render(<App />)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<h1>
  Hi, <em>Pluto</em>!
</h1>
```

</details>

Here is an example that shows how to use a plugin ([`remark-gfm`][remark-gfm],
which adds support for footnotes, strikethrough, tables, tasklists and URLs
directly):

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdown = `Just a link: www.nasa.gov.`

function App(){
  return <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
}

createRoot(document.body).render(<App />)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<p>
  Just a link: <a href="http://www.nasa.gov">www.nasa.gov</a>.
</p>
```

</details>

## API

This package exports the following identifier:
[`defaultUrlTransform`][api-default-url-transform].
The default export is [`Markdown`][api-markdown].

### `Markdown`

Component to render markdown.

###### Parameters

*   `options` ([`Options`][api-options])
    — props

###### Returns

React element (`JSX.Element`).

### `defaultUrlTransform(url)`

Make a URL safe.

###### Parameters

*   `url` (`string`)
    — URL

###### Returns

Safe URL (`string`).

### `AllowElement`

Filter elements (TypeScript type).

###### Parameters

*   `node` ([`Element` from `hast`][hast-element])
    — element to check
*   `index` (`number | undefined`)
    — index of `element` in `parent`
*   `parent` ([`Node` from `hast`][hast-node])
    — parent of `element`

###### Returns

Whether to allow `element` (`boolean`, optional).

### `Components`

Map tag names to components (TypeScript type).

###### Type

```ts
import type {Element} from 'hast'

type Components = Partial<{
  [TagName in keyof JSX.IntrinsicElements]:
    // Class component:
    | (new (props: JSX.IntrinsicElements[TagName] & ExtraProps) => JSX.ElementClass)
    // Function component:
    | ((props: JSX.IntrinsicElements[TagName] & ExtraProps) => JSX.Element | string | null | undefined)
    // Tag name:
    | keyof JSX.IntrinsicElements
}>
```

### `ExtraProps`

Extra fields we pass to components (TypeScript type).

###### Fields

*   `node` ([`Element` from `hast`][hast-element], optional)
    — original node

### `Options`

Configuration (TypeScript type).

###### Fields

*   `allowElement` ([`AllowElement`][api-allow-element], optional)
    — filter elements;
    `allowedElements` / `disallowedElements` is used first
*   `allowedElements` (`Array<string>`, default: all tag names)
    — tag names to allow;
    cannot combine w/ `disallowedElements`
*   `children` (`string`, optional)
    — markdown
*   `className` (`string`, optional)
    — wrap in a `div` with this class name
*   `components` ([`Components`][api-components], optional)
    — map tag names to components
*   `disallowedElements` (`Array<string>`, default: `[]`)
    — tag names to disallow;
    cannot combine w/ `allowedElements`
*   `rehypePlugins` (`Array<Plugin>`, optional)
    — list of [rehype plugins][rehype-plugins] to use
*   `remarkPlugins` (`Array<Plugin>`, optional)
    — list of [remark plugins][remark-plugins] to use
*   `remarkRehypeOptions` ([`Options` from
    `remark-rehype`][remark-rehype-options], optional)
    — options to pass through to `remark-rehype`
*   `skipHtml` (`boolean`, default: `false`)
    — ignore HTML in markdown completely
*   `unwrapDisallowed` (`boolean`, default: `false`)
    — extract (unwrap) what’s in disallowed elements;
    normally when say `strong` is not allowed, it and it’s children are dropped,
    with `unwrapDisallowed` the element itself is replaced by its children
*   `urlTransform` ([`UrlTransform`][api-url-transform], default:
    [`defaultUrlTransform`][api-default-url-transform])
    — change URLs

### `UrlTransform`

Transform URLs (TypeScript type).

###### Parameters

*   `url` (`string`)
    — URL
*   `key` (`string`, example: `'href'`)
    — property name
*   `node` ([`Element` from `hast`][hast-element])
    — element to check

###### Returns

Transformed URL (`string`, optional).

## Examples

### Use a plugin

This example shows how to use a remark plugin.
In this case, [`remark-gfm`][remark-gfm], which adds support for strikethrough,
tables, tasklists and URLs directly:

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`

function App() {
  return <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
}

createRoot(document.body).render(<App />)
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
  <ul className="contains-task-list">
    <li>Lists</li>
    <li className="task-list-item">
      <input type="checkbox" disabled /> todo
    </li>
    <li className="task-list-item">
      <input type="checkbox" disabled checked /> done
    </li>
  </ul>
  <p>A table:</p>
  <table>
    <thead>
      <tr>
        <th>a</th>
        <th>b</th>
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
[`remark-gfm`][remark-gfm] has an option to allow only double tildes for
strikethrough:

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdown = 'This ~is not~ strikethrough, but ~~this is~~!'

function App() {
  return (
    <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}]]}>
      {markdown}
    </Markdown>
  )
}

createRoot(document.body).render(<App />)
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

<!-- To do: currently broken on actual ESM; let’s find an alternative? -->

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

// Did you know you can use tildes instead of backticks for code in markdown? ✨
const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`

function generateCodeBlock(
  props
) {
  const match = /language-(\w+)/.exec(props.className || '');
  return match ? (
    <SyntaxHighlighter
      style={dark}
      language={match[1]}
      showLineNumbers
      className={props.className}
    >
      {String(props.children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={props.className}>{props.children}</code>
  );
}

function App() {

  return (
  <Markdown
        components={{
      code: generateCodeBlock,
    }}
    >
      {children}
    </Markdown>
  )
}

createRoot(document.body).render(<App />)
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

This example shows how a syntax extension (through [`remark-math`][remark-math])
is used to support math in markdown, and a transform plugin
([`rehype-katex`][rehype-katex]) to render that math.

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

const markdown = `The lift coefficient ($C_L$) is a dimensionless coefficient.`

function App() {
  return (
    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {markdown}
    </Markdown>
  )
}

createRoot(document.body).render(<App />)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<p>
  The lift coefficient (
  <span className="katex">
    <span className="katex-mathml">
      <math xmlns="http://www.w3.org/1998/Math/MathML">{/* … */}</math>
    </span>
    <span className="katex-html" aria-hidden="true">
      {/* … */}
    </span>
  </span>
  ) is a dimensionless coefficient.
</p>
```

</details>

## Plugins

We use [unified][], specifically [remark][] for markdown and [rehype][] for
HTML, which are tools to transform content with plugins.
Here are three good ways to find plugins:

*   [`awesome-remark`][awesome-remark] and [`awesome-rehype`][awesome-rehype]
    — selection of the most awesome projects
*   [List of remark plugins][remark-plugins] and
    [list of rehype plugins][rehype-plugins]
    — list of all plugins
*   [`remark-plugin`][remark-plugin] and [`rehype-plugin`][rehype-plugin] topics
    — any tagged repo on GitHub

## Syntax

`react-markdown` follows CommonMark, which standardizes the differences between
markdown implementations, by default.
Some syntax extensions are supported through plugins.

We use [`micromark`][micromark] under the hood for our parsing.
See its documentation for more information on markdown, CommonMark, and
extensions.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types
[`AllowElement`][api-allow-element],
[`ExtraProps`][api-extra-props],
[`Components`][api-components],
[`Options`][api-options], and
[`UrlTransform`][api-url-transform].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `react-markdown@^9`,
compatible with Node.js 16.

They work in all modern browsers (essentially: everything not IE 11).
You can use a bundler (such as esbuild, webpack, or Rollup) to use this package
in your project, and use its options (or plugins) to add support for legacy
browsers.

## Architecture

<pre><code>                                                           react-markdown
         +----------------------------------------------------------------------------------------------------------------+
         |                                                                                                                |
         |  +----------+        +----------------+        +---------------+       +----------------+       +------------+ |
         |  |          |        |                |        |               |       |                |       |            | |
<a href="https://commonmark.org">markdown</a>-+->+  <a href="https://github.com/remarkjs/remark">remark</a>  +-<a href="https://github.com/syntax-tree/mdast">mdast</a>->+ <a href="https://github.com/remarkjs/remark/blob/main/doc/plugins.md">remark plugins</a> +-<a href="https://github.com/syntax-tree/mdast">mdast</a>->+ <a href="https://github.com/remarkjs/remark-rehype">remark-rehype</a> +-<a href="https://github.com/syntax-tree/hast">hast</a>->+ <a href="https://github.com/rehypejs/rehype/blob/main/doc/plugins.md">rehype plugins</a> +-<a href="https://github.com/syntax-tree/hast">hast</a>->+ <a href="#appendix-b-components">components</a> +-+->react elements
         |  |          |        |                |        |               |       |                |       |            | |
         |  +----------+        +----------------+        +---------------+       +----------------+       +------------+ |
         |                                                                                                                |
         +----------------------------------------------------------------------------------------------------------------+
</code></pre>

To understand what this project does, it’s important to first understand what
unified does: please read through the [`unifiedjs/unified`][unified] readme (the
part until you hit the API section is required reading).

`react-markdown` is a unified pipeline — wrapped so that most folks don’t need
to directly interact with unified.
The processor goes through these steps:

*   parse markdown to mdast (markdown syntax tree)
*   transform through remark (markdown ecosystem)
*   transform mdast to hast (HTML syntax tree)
*   transform through rehype (HTML ecosystem)
*   render hast to React with components

## Appendix A: HTML in markdown

`react-markdown` typically escapes HTML (or ignores it, with `skipHtml`)
because it is dangerous and defeats the purpose of this library.

However, if you are in a trusted environment (you trust the markdown), and
can spare the bundle size (±60kb minzipped), then you can use
[`rehype-raw`][rehype-raw]:

```jsx
import React from 'react'
import {createRoot} from 'react-dom/client';
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

const markdown = `<div class="note">

Some *emphasis* and <strong>strong</strong>!

</div>`

function App() {
  return <Markdown rehypePlugins={[rehypeRaw]}>{markdown}</Markdown>
}

createRoot(document.body).render(<App />)
```

<details>
<summary>Show equivalent JSX</summary>

```jsx
<div className="note">
  <p>
    Some <em>emphasis</em> and <strong>strong</strong>!
  </p>
</div>
```

</details>

**Note**: HTML in markdown is still bound by how [HTML works in
CommonMark][commonmark-html].
Make sure to use blank lines around block-level HTML that again contains
markdown!

## Appendix B: Components

You can also change the things that come from markdown:

```jsx
<Markdown
  components={{
    // Map `h1` (`# heading`) to use `h2`s.
    h1: 'h2',
    // Rewrite `em`s (`*like so*`) to `i` with a red foreground color.
    em(props) {
      const {node, ...rest} = props
      return <i style={{color: 'red'}} {...rest} />
    }
  }}
/>
```

The keys in components are HTML equivalents for the things you write with
markdown (such as `h1` for `# heading`).
Normally, in markdown, those are: `a`, `blockquote`, `br`, `code`, `em`, `h1`,
`h2`, `h3`, `h4`, `h5`, `h6`, `hr`, `img`, `li`, `ol`, `p`, `pre`, `strong`, and
`ul`.
With [`remark-gfm`][remark-gfm], you can also use `del`, `input`, `table`,
`tbody`, `td`, `th`, `thead`, and `tr`.
Other remark or rehype plugins that add support for new constructs will also
work with `react-markdown`.

The props that are passed are what you probably would expect: an `a` (link) will
get `href` (and `title`) props, and `img` (image) an `src`, `alt` and `title`,
etc.

Every component will receive a `node`.
This is the original [`Element` from `hast`][hast-element] element being turned
into a React element.

## Appendix C: line endings in markdown (and JSX)

You might have trouble with how line endings work in markdown and JSX.
We recommend the following, which solves all line ending problems:

```jsx
// If you write actual markdown in your code, put your markdown in a variable;
// **do not indent markdown**:
const markdown = `
# This is perfect!
`

// Pass the value as an expresion as an only child:
const result = <Markdown>{markdown}</Markdown>
```

👆 That works.
Read on for what doesn’t and why that is.

You might try to write markdown directly in your JSX and find that it **does
not** work:

```jsx
<Markdown>
  # Hi

  This is **not** a paragraph.
</Markdown>
```

The is because in JSX the whitespace (including line endings) is collapsed to
a single space.
So the above example is equivalent to:

```jsx
<Markdown> # Hi This is **not** a paragraph. </Markdown>
```

Instead, to pass markdown to `Markdown`, you can use an expression:
with a template literal:

```jsx
<Markdown>{`
# Hi

This is a paragraph.
`}</Markdown>
```

Template literals have another potential problem, because they keep whitespace
(including indentation) inside them.
That means that the following **does not** turn into a heading:

```jsx
<Markdown>{`
    # This is **not** a heading, it’s an indented code block
`}</Markdown>
```

## Security

Use of `react-markdown` is secure by default.
Overwriting `urlTransform` to something insecure will open you up to XSS
vectors.
Furthermore, the `remarkPlugins`, `rehypePlugins`, and `components` you use may
be insecure.

To make sure the content is completely safe, even after what plugins do,
use [`rehype-sanitize`][rehype-sanitize].
It lets you define your own schema of what is and isn’t allowed.

## Related

*   [`MDX`][mdx]
    — JSX *in* markdown
*   [`remark-gfm`][remark-gfm]
    — add support for GitHub flavored markdown support
*   [`react-remark`][react-remark]
    — hook based alternative
*   [`rehype-react`][rehype-react]
    — turn HTML into React elements

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

[size-badge]: https://img.shields.io/bundlejs/size/react-markdown

[size]: https://bundlejs.com/?q=react-markdown

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[health]: https://github.com/remarkjs/.github

[coc]: https://github.com/remarkjs/.github/blob/main/code-of-conduct.md

[contributing]: https://github.com/remarkjs/.github/blob/main/contributing.md

[support]: https://github.com/remarkjs/.github/blob/main/support.md

[license]: license

[author]: https://espen.codes/

[awesome-remark]: https://github.com/remarkjs/awesome-remark

[awesome-rehype]: https://github.com/rehypejs/awesome-rehype

[commonmark-help]: https://commonmark.org/help/

[commonmark-html]: https://spec.commonmark.org/0.30/#html-blocks

[hast-element]: https://github.com/syntax-tree/hast#element

[hast-node]: https://github.com/syntax-tree/hast#nodes

[mdx]: https://github.com/mdx-js/mdx/

[micromark]: https://github.com/micromark/micromark

[react]: http://reactjs.org

[react-remark]: https://github.com/remarkjs/react-remark

[react-syntax-highlighter]: https://github.com/react-syntax-highlighter/react-syntax-highlighter

[rehype]: https://github.com/rehypejs/rehype

[rehype-katex]: https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex

[rehype-plugin]: https://github.com/topics/rehype-plugin

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins

[rehype-react]: https://github.com/rehypejs/rehype-react

[rehype-raw]: https://github.com/rehypejs/rehype-raw

[rehype-sanitize]: https://github.com/rehypejs/rehype-sanitize

[remark]: https://github.com/remarkjs/remark

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[remark-math]: https://github.com/remarkjs/remark-math

[remark-plugin]: https://github.com/topics/remark-plugin

[remark-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins

[remark-rehype-options]: https://github.com/remarkjs/remark-rehype#options

[unified]: https://github.com/unifiedjs/unified

[typescript]: https://www.typescriptlang.org

[conor]: https://github.com/conorhastings

[demo]: https://remarkjs.github.io/react-markdown/

[section-components]: #appendix-b-components

[section-plugins]: #plugins

[section-security]: #security

[section-syntax]: #syntax

[api-allow-element]: #allowelement

[api-components]: #components

[api-default-url-transform]: #defaulturltransformurl

[api-extra-props]: #extraprops

[api-markdown]: #markdown

[api-options]: #options

[api-url-transform]: #urltransform
