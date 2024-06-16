# Changelog

All notable changes will be documented in this file.

## 9.0.0 - 2023-09-27

* [`b67d714`](https://github.com/remarkjs/react-markdown/commit/b67d714)
  Change to require Node.js 16\
  **migrate**: update too
* [`ec2b134`](https://github.com/remarkjs/react-markdown/commit/ec2b134)
  Change to require React 18\
  **migrate**: update too
* [`bf5824f`](https://github.com/remarkjs/react-markdown/commit/bf5824f)
  Change to use `exports`\
  **migrate**: don’t use private APIs
* [`c383a45`](https://github.com/remarkjs/react-markdown/commit/c383a45)
  Update `@types/hast`, utilities, plugins, etc\
  **migrate**: update too
* [`eca5e6b`](https://github.com/remarkjs/react-markdown/commit/eca5e6b)
  [`08ead9e`](https://github.com/remarkjs/react-markdown/commit/08ead9e)
  Replace `transformImageUri`, `transformLinkUri` w/ `urlTransform`\
  **migrate**: see “Add `urlTransform`” below
* [`de29396`](https://github.com/remarkjs/react-markdown/commit/de29396)
  Remove `linkTarget` option\
  **migrate**: see “Remove `linkTarget`” below
* [`4346276`](https://github.com/remarkjs/react-markdown/commit/4346276)
  Remove support for passing custom props to components\
  **migrate**: see “Remove `includeElementIndex`”, “Remove `rawSourcePos`”,
  “Remove `sourcePos`”, “Remove extra props passed to certain components”
  below
* [`c0dfbd6`](https://github.com/remarkjs/react-markdown/commit/c0dfbd6)
  Remove UMD bundle from package\
  **migrate**: use `esm.sh` or a CDN or so
* [`e12b5e9`](https://github.com/remarkjs/react-markdown/commit/e12b5e9)
  Remove `prop-types`\
  **migrate**: use TypeScript
* [`4eb7aa0`](https://github.com/remarkjs/react-markdown/commit/4eb7aa0)
  Change to throw errors for removed props\
  **migrate**: don’t pass options that don’t do things
* [`8aabf74`](https://github.com/remarkjs/react-markdown/commit/8aabf74)
  Change to improve error messages\
  **migrate**: expect better messages

### Add `urlTransform`

The `transformImageUri` and `transformLinkUri` were removed.
Having two functions is a bit much, particularly because there are more URLs
you might want to change (or which might be unsafe so *we* make them safe).
And their name and APIs were a bit weird.
You can use the new `urlTransform` prop instead to change all your URLs.

### Remove `linkTarget`

The `linkTarget` option was removed; you should likely not set targets.
If you want to, use
[`rehype-external-links`](https://github.com/rehypejs/rehype-external-links).

### Remove `includeElementIndex`

The `includeElementIndex` option was removed, so `index` is never passed to
components.
Write a plugin to pass `index`:

<details>
<summary>Show example of plugin</summary>

```jsx
import {visit} from 'unist-util-visit'

function rehypePluginAddingIndex() {
  /**
   * @param {import('hast').Root} tree
   * @returns {undefined}
   */
  return function (tree) {
    visit(tree, function (node, index) {
      if (node.type === 'element' && typeof index === 'number') {
        node.properties.index = index
      }
    })
  }
}
```

</details>

### Remove `rawSourcePos`

The `rawSourcePos` option was removed, so `sourcePos` is never passed to
components.
All components are passed `node`, so you can get `node.position` from them.

### Remove `sourcePos`

The `sourcePos` option was removed, so `data-sourcepos` is never passed to
elements.
Write a plugin to pass `index`:

<details>
<summary>Show example of plugin</summary>

```jsx
import {stringifyPosition} from 'unist-util-stringify-position'
import {visit} from 'unist-util-visit'

function rehypePluginAddingIndex() {
  /**
   * @param {import('hast').Root} tree
   * @returns {undefined}
   */
  return function (tree) {
    visit(tree, function (node) {
      if (node.type === 'element') {
        node.properties.dataSourcepos = stringifyPosition(node.position)
      }
    })
  }
}
```

</details>

### Remove extra props passed to certain components

When overwriting components, these props are no longer passed:

* `inline` on `code`
  — create a plugin or use `pre` for the block
* `level` on `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
  — check `node.tagName` instead
* `checked` on `li`
  — check `task-list-item` class or check `props.children`
* `index` on `li`
  — create a plugin
* `ordered` on `li`
  — create a plugin or check the parent
* `depth` on `ol`, `ul`
  — create a plugin
* `ordered` on `ol`, `ul`
  — check `node.tagName` instead
* `isHeader` on `td`, `th`
  — check `node.tagName` instead
* `isHeader` on `tr`
  — create a plugin or check children

## 8.0.7 - 2023-04-12

* [`c289176`](https://github.com/remarkjs/react-markdown/commit/c289176)
  Fix performance for keys
  by [**@wooorm**](https://github.com/wooorm)
  in [#738](https://github.com/remarkjs/react-markdown/pull/738)
* [`9034dbd`](https://github.com/remarkjs/react-markdown/commit/9034dbd)
  Fix types in syntax highlight example
  by [**@dlqqq**](https://github.com/dlqqq)
  in [#736](https://github.com/remarkjs/react-markdown/pull/736)

**Full Changelog**: <https://github.com/remarkjs/react-markdown/compare/8.0.6...8.0.7>

## 8.0.6 - 2023-03-20

* [`33ab015`](https://github.com/remarkjs/react-markdown/commit/33ab015)
  Update to TS 5\
  by [**@Methuselah96**](https://github.com/Methuselah96)
  in [#734](https://github.com/remarkjs/react-markdown/issues/734)

## 8.0.5 - 2023-01-17

* [`d640d40`](https://github.com/remarkjs/react-markdown/commit/d640d40)
  Update to use `node16` module resolution in `tsconfig.json`\
  by [**@ChristianMurphy**](https://github.com/ChristianMurphy)
  in [#723](https://github.com/remarkjs/react-markdown/pull/723)
* [`402fea3`](https://github.com/remarkjs/react-markdown/commit/402fea3)
  Fix typo in `plugins` deprecation message\
  by [**@marc2332**](https://github.com/marc2332)
  in [#719](https://github.com/remarkjs/react-markdown/pull/719)
* [`4f98f73`](https://github.com/remarkjs/react-markdown/commit/4f98f73)
  Remove deprecated and unneeded `defaultProps`\
  by [**@Lepozepo**](https://github.com/Lepozepo)
  in [#718](https://github.com/remarkjs/react-markdown/pull/718)

## 8.0.4 - 2022-12-01

* [`9b20440`](https://github.com/remarkjs/react-markdown/commit/9b20440)
  Fix type of `td`, `th` props\
  by [**@lucasassisrosa**](https://github.com/lucasassisrosa)
  in [#714](https://github.com/remarkjs/react-markdown/pull/714)
* [`cfe075b`](https://github.com/remarkjs/react-markdown/commit/cfe075b)
  Add clarification of `alt` on `img` in docs\
  by [**@cballenar**](https://github.com/cballenar)
  in [#692](https://github.com/remarkjs/react-markdown/pull/692)

## 8.0.3 - 2022-04-20

* [`a2fb833`](https://github.com/remarkjs/react-markdown/commit/a2fb833)
  Fix prop types of plugins\
  by [**@starpit**](https://github.com/starpit)
  in [#683](https://github.com/remarkjs/react-markdown/pull/683)

## 8.0.2 - 2022-03-31

* [`2712227`](https://github.com/remarkjs/react-markdown/commit/2712227)
  Update `react-is`
* [`704c3c6`](https://github.com/remarkjs/react-markdown/commit/704c3c6)
  Fix TypeScript bug by adding workaround\
  by [**@Methuselah96**](https://github.com/Methuselah96)
  in [#676](https://github.com/remarkjs/react-markdown/pull/676)

## 8.0.1 - 2022-03-14

* [`c23ecf6`](https://github.com/remarkjs/react-markdown/commit/c23ecf6)
  Add missing dependency for types\
  by [**@Methuselah96**](https://github.com/Methuselah96)
  in [#675](https://github.com/remarkjs/react-markdown/pull/675)

## 8.0.0 - 2022-01-17

<a name="change-plugins-to-remarkplugins"></a>

* [`cd845c9`](https://github.com/remarkjs/react-markdown/commit/cd845c9)
  Remove deprecated `plugins` option\
  (**migrate by renaming it to `remarkPlugins`**)
* [`36e4916`](https://github.com/remarkjs/react-markdown/commit/36e4916)
  Update [`remark-rehype`](https://github.com/remarkjs/remark-rehype),
  add support for passing it options\
  by [**@peolic**](https://github.com/peolic)
  in [#669](https://github.com/remarkjs/react-markdown/pull/669)\
  (**migrate by removing `remark-footnotes` and updating `remark-gfm` if you
  were using them, otherwise you shouldn’t notice this**)

## 7.1.2 - 2022-01-02

* [`656a4fa`](https://github.com/remarkjs/react-markdown/commit/656a4fa)
  Fix `ref` in types\
  by [**@ChristianMurphy**](https://github.com/ChristianMurphy)
  in [#668](https://github.com/remarkjs/react-markdown/pull/668)

## 7.1.1 - 2021-11-29

* [`4185f06`](https://github.com/remarkjs/react-markdown/commit/4185f06)
  Add improved docs\
  by [**@wooorm**](https://github.com/wooorm)
  in [#657](https://github.com/remarkjs/react-markdown/pull/657)

## 7.1.0 - 2021-10-21

* [`7b8a829`](https://github.com/remarkjs/react-markdown/commit/7b8a829)
  Add support for `SpecialComponents` to be any `ComponentType`\
  by [**@Methuselah96**](https://github.com/Methuselah96)
  in [#640](https://github.com/remarkjs/react-markdown/pull/640)
* [`a7c26fc`](https://github.com/remarkjs/react-markdown/commit/a7c26fc)
  Remove warning on whitespace in tables

## 7.0.1 - 2021-08-26

* [`ec387c2`](https://github.com/remarkjs/react-markdown/commit/ec387c2)
  Add improved type for `linkTarget` as string
* [`5af6bc7`](https://github.com/remarkjs/react-markdown/commit/5af6bc7)
  Fix to correctly compile intrinsic types

## 7.0.0 - 2021-08-13

Welcome to version 7.
This a major release and therefore contains breaking changes.

### Breaking changes

* [`01b11fe`](https://github.com/remarkjs/react-markdown/commit/01b11fe)
  [`c613efd`](https://github.com/remarkjs/react-markdown/commit/c613efd)
  [`a1e1c3f`](https://github.com/remarkjs/react-markdown/commit/a1e1c3f)
  [`aeee9ac`](https://github.com/remarkjs/react-markdown/commit/aeee9ac)
  Use ESM
  (please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c))
* [`3dffd6a`](https://github.com/remarkjs/react-markdown/commit/3dffd6a)
  Update dependencies
  (upgrade all your plugins and this should go fine)

### Internals

* [`8b5481c`](https://github.com/remarkjs/react-markdown/commit/8b5481c)
  [`fb1b512`](https://github.com/remarkjs/react-markdown/commit/fb1b512)
  [`144af79`](https://github.com/remarkjs/react-markdown/commit/144af79)
  Replace `jest` with `uvu`
* [`8c572df`](https://github.com/remarkjs/react-markdown/commit/8c572df)
  Replace `rollup` with `esbuild`
* [`8737eac`](https://github.com/remarkjs/react-markdown/commit/8737eac)
  [`28d4c75`](https://github.com/remarkjs/react-markdown/commit/28d4c75)
  [`b2dd046`](https://github.com/remarkjs/react-markdown/commit/b2dd046)
  Refactor code-style

## 6.0.3 - 2021-07-30

* [`13367ed`](https://github.com/remarkjs/react-markdown/commit/13367ed)
  Fix types to include each element w/ its properties
* [`0a1931a`](https://github.com/remarkjs/react-markdown/commit/0a1931a)
  Fix to add min version of `property-information`

## 6.0.2 - 2021-05-06

* [`cefc02d`](https://github.com/remarkjs/react-markdown/commit/cefc02d)
  Add string type for `className`s
* [`6355e45`](https://github.com/remarkjs/react-markdown/commit/6355e45)
  Fix to pass `vfile` to plugins
* [`5cf6e1b`](https://github.com/remarkjs/react-markdown/commit/5cf6e1b)
  Fix to add warning when non-strings are given as `children`

## 6.0.1 - 2021-04-23

* [`2e956be`](https://github.com/remarkjs/react-markdown/commit/2e956be)
  Fix whitespace in table elements
* [`d36048a`](https://github.com/remarkjs/react-markdown/commit/d36048a)
  Add architecture section to readme

## 6.0.0 - 2021-04-15

Welcome to version 6.
This a major release and therefore contains breaking changes.

### Change `renderers` to `components`

`react-markdown` used to let you define components for *markdown* constructs
(`link`, `delete`, `break`, etc).
This proved complex as users didn’t know about those names or markdown
peculiarities (such as that there are fully formed links *and* link references).

See [**GH-549**](https://github.com/remarkjs/react-markdown/issues/549) for more
on why this changed.
See [**Appendix B: Components** in
`readme.md`](https://github.com/remarkjs/react-markdown#appendix-b-components)
for more on components.

<details>
<summary>Show example of needed change</summary>

Before (**broken**):

```jsx
<Markdown
  renderers={{
    // Use a fancy hr
    thematicBreak: ({node, ...props}) => <MyFancyRule {...props} />
  }}
>{`***`}</Markdown>
```

Now (**fixed**):

```jsx
<Markdown
  components={{
    // Use a fancy hr
    hr: ({node, ...props}) => <MyFancyRule {...props} />
  }}
>{`***`}</Markdown>
```

</details>

<details>
<summary>Show conversion table</summary>

| Type (`renderers`)                  | Tag names (`components`)                |
| ----------------------------------- | --------------------------------------- |
| `blockquote`                        | `blockquote`                            |
| `break`                             | `br`                                    |
| `code`, `inlineCode`                | `code`, `pre`**​\*​**                   |
| `definition`                        | **†**                                   |
| `delete`                            | `del`**‡**                              |
| `emphasis`                          | `em`                                    |
| `heading`                           | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`**§** |
| `html`, `parsedHtml`, `virtualHtml` | **‖**                                   |
| `image`, `imageReference`           | `img`**†**                              |
| `link`, `linkReference`             | `a`**†**                                |
| `list`                              | `ol`, `ul`**¶**                         |
| `listItem`                          | `li`                                    |
| `paragraph`                         | `p`                                     |
| `root`                              | **​\*\*​**                              |
| `strong`                            | `strong`                                |
| `table`                             | `table`**‡**                            |
| `tableHead`                         | `thead`**‡**                            |
| `tableBody`                         | `tbody`**‡**                            |
| `tableRow`                          | `tr`**‡**                               |
| `tableCell`                         | `td`, `th`**‡**                         |
| `text`                              |                                         |
| `thematicBreak`                     | `hr`                                    |

* **​\*​** It’s possible to differentiate between code based on the `inline`
  prop.
  Block code is also wrapped in a `pre`
* **†** Resource (`[text](url)`) and reference (`[text][id]`) style links and
  images (and their definitions) are now resolved and treated the same
* **‡** Available when using
  [`remark-gfm`](https://github.com/remarkjs/remark-gfm)
* **§** It’s possible to differentiate between heading based on the `level`
  prop
* **‖** When using `rehype-raw` (see below), components for those elements
  can also be used (for example, `abbr` for
  `<abbr title="HyperText Markup Language">HTML</abbr>`)
* **¶** It’s possible to differentiate between lists based on the `ordered`
  prop
* **​\*\*​** Wrap `ReactMarkdown` in a component instead

</details>

### Add `rehypePlugins`

We’ve added another plugin system:
[**rehype**](https://github.com/rehypejs/rehype).
It’s similar to remark (what we’re using for markdown) but for HTML.

There are many rehype plugins.
Some examples are
[`@mapbox/rehype-prism`](https://github.com/mapbox/rehype-prism)
(syntax highlighting with Prism),
[`rehype-katex`](https://github.com/remarkjs/remark-math/tree/HEAD/packages/rehype-katex)
(rendering math with KaTeX), or
[`rehype-autolink-headings`](https://github.com/rehypejs/rehype-autolink-headings)
(adding links to headings).

See [List of plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md)
for more plugins.

<details>
<summary>Show example of feature</summary>

```jsx
import rehypeHighlight from 'rehype-highlight'

<Markdown rehypePlugins={[rehypeHighlight]}>{`~~~js
console.log(1)
~~~`}</Markdown>
```

</details>

### Remove buggy HTML in markdown parser

In a lot of cases, you should not use HTML in markdown: it’s most always unsafe.
And it defeats much of the purpose of this project (not relying on
`dangerouslySetInnerHTML`).

`react-markdown` used to have an opt-in HTML parser with a bunch of bugs.
As we now support rehype plugins, we can defer that work to a rehype plugin.
To support HTML in markdown with `react-markdown`, use
[`rehype-raw`](https://github.com/rehypejs/rehype-raw).
The `astPlugins` and `allowDangerousHtml` (previously called `escapeHtml`) props
are no longer needed and were removed.

When using `rehype-raw`, you should probably use
[`rehype-sanitize`](https://github.com/rehypejs/rehype-sanitize)
too.

<details>
<summary>Show example of needed change</summary>

Before (**broken**):

```jsx
import MarkdownWithHtml from 'react-markdown/with-html'

<MarkdownWithHtml>{`# Hello, <i>world</i>!`}</MarkdownWithHtml>
```

Now (**fixed**):

```jsx
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

<Markdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>{`# Hello, <i>world</i>!`}</Markdown>
```

</details>

### Change `source` to `children`

Instead of passing a `source` pass `children` instead:

<details>
<summary>Show example of needed change</summary>

Before (**broken**):

```jsx
<Markdown source="some\nmarkdown"></Markdown>
```

Now (**fixed**):

```jsx
<Markdown>{`some
markdown`}</Markdown>
```

Or (**also fixed**):

```jsx
<Markdown children={`some
markdown`} />
```

</details>

### Replace `allowNode`, `allowedTypes`, and `disallowedTypes`

Similar to the `renderers` to `components` change, the filtering options
also changed from being based on markdown names towards being based on HTML
names: `allowNode` to `allowElement`, `allowedTypes` to `allowedElements`, and
`disallowedTypes` to `disallowedElements`.

<details>
<summary>Show example of needed change</summary>

Before (**broken**):

```jsx
<Markdown
  // Skip images
  disallowedTypes={['image']}
>{`![alt text](./image.url)`}</Markdown>
```

Now (**fixed**):

```jsx
<Markdown
  // Skip images
  disallowedElements={['img']}
>{`![alt text](./image.url)`}</Markdown>
```

***

Before (**broken**):

```jsx
<Markdown
  // Skip h1
  allowNode={(node) => node.type !== 'heading' || node.depth !== 1}
>{`# main heading`}</Markdown>
```

Now (**fixed**):

```jsx
<Markdown
  // Skip h1
  allowElement={(element) => element.tagName !== 'h1'}
>{`# main heading`}</Markdown>
```

</details>

### Change `includeNodeIndex` to `includeElementIndex`

Similar to the `renderers` to `components` change, this option to pass more info
to components also changed from being based on markdown to being based on HTML.

<details>
<summary>Show example of needed change</summary>

Before (**broken**):

```jsx
<Markdown
  includeNodeIndex={true}
  renderers={{
    paragraph({node, index, parentChildCount, ...props}) => <MyFancyParagraph {...props} />
  }}
>{`Some text`}</Markdown>
```

Now (**fixed**):

```jsx
<Markdown
  includeElementIndex={true}
  components={{
    p({node, index, siblingsCount, ...props}) => <MyFancyParagraph {...props} />
  }}
>{`Some text`}</Markdown>
```

</details>

### Change signature of `transformLinkUri`, `linkTarget`

The second parameter of these functions (to rewrite `href` on `a` or to define
`target` on `a`) are now [hast](https://github.com/syntax-tree/hast) (HTML AST)
instead of [mdast](https://github.com/syntax-tree/mdast) (markdown AST).

### Change signature of `transformImageUri`

The second parameter of this function was always `undefined` and the fourth was
the `alt` (`string`) on the image.
The second parameter is now that `alt`.

### Remove support for React 15, IE11

We now use ES2015 (such as `Object.assign`) and removed certain hacks to work
with React 15 and older.

## 5.0.3 - 2020-10-23

* [`bb0bdde`](https://github.com/remarkjs/react-markdown/commit/bb0bdde)
  Unlock peer dependency on React to allow v17
* [`24e42bd`](https://github.com/remarkjs/react-markdown/commit/24e42bd)
  Fix exception on missing element from `html-to-react`
* [`3d363e9`](https://github.com/remarkjs/react-markdown/commit/3d363e9)
  Fix umd browser build

## 5.0.2 - 2020-10-23

* [`4dadaba`](https://github.com/remarkjs/react-markdown/commit/4dadaba)
  Fix to allow combining `allowedTypes`, `unwrapDisallowed` in types

## 5.0.1 - 2020-10-21

* [`c3dc5ee`](https://github.com/remarkjs/react-markdown/commit/c3dc5ee)
  Fix to not crash on empty text nodes

## 5.0.0 - 2020-10-19

### BREAKING

#### Maintained by [unified](https://unifiedjs.com)

This project is now maintained by the unified collective, which also houses the
underlying tools used in `react-markdown`: hundreds of projects for working with
markdown and markup related things (including MDX).
We have cleaned the project: updated dependencies, improved
docs/tests/coverage/types, cleaned the issue tracker, and fixed a couple of
bugs, but otherwise *much should be the same*.

#### Upgrade `remark-parse`

The parser used in `react-markdown` has been upgraded to the latest version.
It is now 100% CommonMark compliant: that means it works the same as in other
places, such as Discourse, Reddit, Stack Overflow, and GitHub.
Note that GitHub does extend CommonMark: to match how Markdown works on GitHub,
use the [`remark-gfm`](https://github.com/remarkjs/remark-gfm) plugin.

* [`remark-parse@9.0.0`](https://github.com/remarkjs/remark/releases/tag/remark-parse%409.0.0)
* [`remark-parse@8.0.0`](https://github.com/remarkjs/remark/releases/tag/remark-parse%408.0.0)
* [`remark-parse@7.0.0`](https://github.com/remarkjs/remark/releases/tag/remark-parse%407.0.0)
* [`remark-parse@6.0.0`](https://github.com/remarkjs/remark/releases/tag/remark-parse%406.0.0)

#### New serializer property: `node`

A new `node` prop is passed to all non-tag/non-fragment renderers.
This contains the raw [mdast](https://github.com/syntax-tree/mdast) AST node,
which opens up a number of interesting possibilities.
The breaking change is for renderers which blindly spread their props to an
underlying component/tag.
For instance:

```jsx
<ReactMarkdown renderers={{link: props => <a {...props} />}} … />
```

Should now be written as:

```jsx
<ReactMarkdown renderers={{link: ({node, ...props}) => <a {...props} />}} … />
```

#### List/list item `tight` property replaced by `spread`

Previously, the `tight` property would hint as to whether or not list items
should be wrapped in paragraphs.
This logic has now been replaced by a new `spread` property, which behaves
slightly differently.
[Read more](https://github.com/remarkjs/remark/pull/364).

## 4.3.1 - 2020-01-05

### Fixes

* (Typings) Fix incorrect typescript definitions (Peng Guanwen)

## 4.3.0 - 2020-01-02

### Fixes

* (Typings) Add typings for `react-markdown/html-parser` (Peng Guanwen)

## 4.2.2 - 2019-09-03

### Fixes

* (Typings) Inline `RemarkParseOptions` for now (Espen Hovlandsdal)

## 4.2.1 - 2019-09-01

### Fixes

* (Typings) Fix incorrect import - `RemarkParseOptions` (Jakub Chrzanowski)

## 4.2.0 - 2019-09-01

### Added

* Add support for plugins that use AST transformations (Frankie Ali)

### Fixes

* (Typings) Add `parserOptions` to type defintions (Ted Piotrowski)
* Allow renderer to be any React element type (Nathan Bierema)

## 4.1.0 - 2019-06-24

### Added

* Add prop `parserOptions` to specify options for remark-parse (Kelvin Chan)

## 4.0.9 - 2019-06-22

### Fixes

* (Typings) Make transformLinkUri & transformImageUri actually nullable
  (Florentin Luca Rieger)

## 4.0.8 - 2019-04-14

### Fixes

* Fix HTML parsing of elements with a single child vs. multiple children
  (Nicolas Venegas)

## 4.0.7 - 2019-04-14

### Fixes

* Fix matching of replaced non-void elements in HTML parser plugin (Nicolas
  Venegas)
* Fix HTML parsing of multiple void elements (Nicolas Venegas)
* Fix void element children invariant violation (Nicolas Venegas)

## 4.0.6 - 2019-01-04

### Fixes

* Mitigate regex ddos by upgrading html-to-react (Christoph Werner)
* Update typings to allow arbitrary node types (Jesse Pinho)
* Readme: Add note about only parsing plugins working (Vincent Tunru)

## 4.0.4 - 2018-11-30

### Changed

* Upgrade dependencies (Espen Hovlandsdal)

## 4.0.3 - 2018-10-11

### Fixes

* Output paragraph element for last item in loose list (Jeremy Moseley)

## 4.0.2 - 2018-10-05

### Fixes

* Fix text rendering in React versions lower than or equal to 15 (Espen
  Hovlandsdal)

## 4.0.1 - 2018-10-03

### Fixes

* \[TypeScript] Fix TypeScript index signature for renderers (Linus Unnebäck)

## 4.0.0 - 2018-10-03

### BREAKING

* `text` is now a first-class node + renderer
  — if you are using `allowedNodes`, it needs to be included in this list.
  Since it is now a React component, it will be passed an object of props
  instead of the old approach where a string was passed.
  `children` will contain the actual text string.
* On React >= 16.2, if no `className` prop is provided, a fragment will be
  used instead of a div.
  To always render a div, pass `'div'` as the `root` renderer.
* On React >= 16.2, escaped HTML will no longer be rendered with div/span
  containers
* The UMD bundle now exports the component as `window.ReactMarkdown` instead
  of `window.reactMarkdown`

### Added

* HTML parser plugin for full HTML compatibility (Espen Hovlandsdal)

### Fixes

* URI transformer allows uppercase http/https URLs (Liam Kennedy)
* \[TypeScript] Strongly type the keys of `renderers` (Linus Unnebäck)

## 3.6.0 - 2018-09-05

### Added

* Add support for passing index info to renderers (Beau Roberts)

## 3.5.0 - 2018-09-03

### Added

* Allow specifying `target` attribute for links (Marshall Smith)

## 3.4.1 - 2018-07-25

### Fixes

* Bump dependency for mdast-add-list-metadata as it was using ES6 features
  (Espen Hovlandsdal)

## 3.4.0 - 2018-07-25

### Added

* Add more metadata props to list and listItem (André Staltz)
  * list: `depth`
  * listItem: `ordered`, `index`

### Fixes

* Make `source` property optional in typescript definition (gRoberts84)

## 3.3.4 - 2018-06-19

### Fixes

* Fix bug where rendering empty link references (`[][]`) would fail (Dennis S)

## 3.3.3 - 2018-06-14

### Fixes

* Fix bug where unwrapping certain disallowed nodes would fail (Petr Gazarov)

## 3.3.2 - 2018-05-07

### Changes

* Add `rawSourcePos` property for passing structured source position info to
  renderers (Espen Hovlandsdal)

## 3.3.1 - 2018-05-07

### Changes

* Pass properties of unknown nodes directly to renderer (Jesse Pinho)
* Update TypeScript definition and prop types (ClassicDarkChocolate)

## 3.3.0 - 2018-03-06

### Added

* Add support for fragment renderers (Benjamim Sonntag)

## 3.2.2 - 2018-02-26

### Fixes

* Fix language escaping in code blocks (Espen Hovlandsdal)

## 3.2.1 - 2018-02-21

### Fixes

* Pass the React key into an overridden text renderer (vanchagreen)

## 3.2.0 - 2018-02-12

### Added

* Allow overriding text renderer (Thibaud Courtoison)

## 3.1.5 - 2018-02-03

### Fixes

* Only use first language from code block (Espen Hovlandsdal)

## 3.1.4 - 2017-12-30

### Fixes

* Enable transformImageUri for image references (evoye)

## 3.1.3 - 2017-12-16

### Fixes

* Exclude babel config from npm package (Espen Hovlandsdal)

## 3.1.2 - 2017-12-16

### Fixes

* Fixed partial table exception (Alexander Wong)

## 3.1.1 - 2017-12-11

### Fixes

* Add readOnly property to checkboxes (Phil Rajchgot)

## 3.1.0 - 2017-11-30

### Added

* Support for checkbox lists (Espen Hovlandsdal)

### Fixes

* Better typings (Igor Kamyshev)

## 3.0.1 - 2017-11-21

### Added

* *Experimental* support for plugins (Espen Hovlandsdal)

### Changes

* Provide more arguments to `transformLinkUri`/`transformImageUri` (children,
  title, alt) (mudrz)

## 3.0.0 - 2017-11-20

### Notes

* **FULL REWRITE**.
  Changed parser from CommonMark to Markdown.
  Big, breaking changes.
  See *BREAKING* below.

### Added

* Table support!
  * New types: `table`, `tableHead`, `tableBody`, `tableRow`, `tableCell`
* New type: `delete` (`~~foo~~`)
* New type: `imageReference`
* New type: `linkReference`
* New type: `definition`
* Hacky, but basic support for React-native rendering of attributeless HTML
  nodes (`<kbd>`, `<sub>`, etc)

### BREAKING

* Container props removed (`containerTagName`, `containerProps`), override
  `root` renderer instead
* `softBreak` option removed.
  New solution will be added at some point in the future.
* `escapeHtml` is now TRUE by default
* `HtmlInline`/`HtmlBlock` are now named `html` (use `isBlock` prop to check\
  if inline or block)
* Renderer names are camelcased and in certain cases, renamed.
  For instance:
  * `Emph` => `emphasis`
  * `Item` => `listItem`
  * `Code` => `inlineCode`
  * `CodeBlock` => `code`
  * `linebreak`/`hardbreak` => `break`
* All renderers: `literal` prop is now called `value`\* List renderer: `type`
  prop is now a boolean named `ordered` (`Bullet` => `false`, `Ordered` =>
  `true`)
* `walker` prop removed.
  Code depending on this will have to be rewritten to use the `astPlugins`
  prop, which functions differently.
* `allowNode` has new arguments (node, index, parent)
  — node has different props, see renderer props
* `childBefore` and `childAfter` props removed.
  Use `root` renderer instead.
* `parserOptions` removed (new parser, so the old options doesn’t make sense
  anymore)

## 2.5.1 - 2017-11-11

### Changes

* Fix `<br/>` not having a node key (Alex Zaworski)

## 2.5.0 - 2017-04-10

### Changes

* Fix deprecations for React v15.5 (Renée Kooi)

## 2.4.6 - 2017-03-14

### Changes

* Fix too strict TypeScript definition (Rasmus Eneman)
* Update JSON-loader info in readme to match webpack 2 (Robin Wieruch)

### Added

* Add ability to pass options to the CommonMark parser (Evan Hensleigh)

## 2.4.4 - 2017-01-16

### Changes

* Fixed TypeScript definitions (Kohei Asai)

## 2.4.3 - 2017-01-12

### Added

* Added TypeScript definitions (Ibragimov Ruslan)

## 2.4.2 - 2016-07-09

### Added

* Added UMD-build (`umd/react-markdown.js`) (Espen Hovlandsdal)

## 2.4.1 - 2016-07-09

### Changes

* Update `commonmark-react-renderer`, fixing a bug with missing nodes
  (Espen Hovlandsdal)

## 2.4.0 - 2016-07-09

### Changes

* Plain DOM-node renderers are now given only their respective props.
  Fixes warnings when using React >= 15.2 (Espen Hovlandsdal)

### Added

* New `transformImageUri` option allows you to transform URIs for images
  (Petri Lehtinen)

## 2.3.0 - 2016-06-06

## Added

* The `walker` instance is now passed to the `walker` callback function
  (Riku Rouvila)

## 2.2.0 - 2016-04-20

* Add `childBefore`/`childAfter` options (Thomas Lindstrøm)

## 2.1.1 - 2016-03-25

* Add `containerProps` option (Thomas Lindstrøm)

## 2.1.0 - 2016-03-12

### Changes

* Join sibling text nodes into one text node (Espen Hovlandsdal)

## 2.0.1 - 2016-02-21

### Changed

* Update `commonmark-react-renderer` dependency to latest version to add keys
  to all elements and simplify custom renderers

## 2.0.0 - 2016-02-21

### Changed

* **Breaking change**: The renderer now requires Node 0.14 or higher.
  This is because the renderer uses stateless components internally.
* **Breaking change**: `allowNode` now receives different properties in the
  options argument.
  See `README.md` for more details.
* **Breaking change**: CommonMark has changed some type names.
  `Html` is now `HtmlInline`, `Header` is now `Heading` and `HorizontalRule`
  is now `ThematicBreak`.
  This affects the `allowedTypes` and `disallowedTypes` options.
* **Breaking change**: A bug in the `allowedTypes`/`disallowedTypes` and
  `allowNode` options made them only applicable to certain types.
  In this version, all types are filtered, as expected.
* **Breaking change**: Link URIs are now filtered through an XSS-filter by
  default, prefixing “dangerous” protocols such as `javascript:` with `x-`
  (eg: `javascript:alert('foo')` turns into `x-javascript:alert('foo')`).
  This can be overridden with the `transformLinkUri`-option.
  Pass `null` to disable the feature or a custom function to replace the
  built-in behaviour.

### Added

* New `renderers` option allows you to customize which React component should
  be used for rendering given types.
  See `README.md` for more details.
  (Espen Hovlandsdal / Guillaume Plique)
* New `unwrapDisallowed` option allows you to select if the contents of a
  disallowed node should be “unwrapped” (placed into the disallowed node
  position).
  For instance, setting this option to true and disallowing a link would still
  render the text of the link, instead of the whole link node and all it’s
  children disappearing.
  (Espen Hovlandsdal)
* New `transformLinkUri` option allows you to transform URIs in links.
  By default, an XSS-filter is used, but you could also use this for use cases
  like transforming absolute to relative URLs, or similar.
  (Espen Hovlandsdal)

## 1.2.4 - 2016-01-28

### Changed

* Rolled back dependencies because of breaking changes

## 1.2.3 - 2016-01-24

### Changed

* Updated dependencies for both `commonmark` and `commonmark-react-parser` to
  work around an embarrassing oversight on my part.

## 1.2.2 - 2016-01-08

### Changed

* Reverted change from 1.2.1 that uses the dist version.
  Instead, documentation is added that specified the need for `json-loader` to
  be enabled when using webpack.

## 1.2.1 - 2015-12-29

### Fixed

* Use pre-built (dist version) of commonmark renderer in order to work around
  JSON-loader dependency.

## 1.2.0 - 2015-12-16

### Added

* Added new `allowNode`-property.
  See README for details.

## 1.1.4 - 2015-12-14

### Fixed

* Set correct `libraryTarget` to make UMD builds work as expected

## 1.1.3 - 2015-12-14

### Fixed

* Update babel dependencies and run prepublish only as actual prepublish, not
  install

## 1.1.1 - 2015-11-28

### Fixed

* Fixed issue with React external name in global environment (`react` vs `React`)

## 1.1.0 - 2015-11-22

### Changed

* Add ability to allow/disallow specific node types (`allowedTypes`/`disallowedTypes`)

## 1.0.5 - 2015-10-22

### Changed

* Moved React from dependency to peer dependency.
