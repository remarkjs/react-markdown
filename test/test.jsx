/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('react').ReactNode} ReactNode
 */

import fs from 'node:fs/promises'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import React from 'react'
import gfm from 'remark-gfm'
import {visit} from 'unist-util-visit'
import raw from 'rehype-raw'
import toc from 'remark-toc'
import ReactDom from 'react-dom/server'
import Markdown from '../index.js'

const own = {}.hasOwnProperty

/**
 * @param {ReturnType<Markdown>} input
 * @returns {string}
 */
function asHtml(input) {
  return ReactDom.renderToStaticMarkup(input)
}

test('can render the most basic of documents (single paragraph)', () => {
  assert.equal(asHtml(<Markdown>Test</Markdown>), '<p>Test</p>')
})

test('should warn when passed `source`', () => {
  const warn = console.warn
  /** @type {unknown} */
  let message

  console.warn = (/** @type {unknown} */ d) => {
    message = d
  }

  // @ts-expect-error runtime
  assert.equal(asHtml(<Markdown source="a">b</Markdown>), '<p>b</p>')
  assert.equal(
    message,
    '[react-markdown] Warning: please use `children` instead of `source` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#change-source-to-children> for more info)'
  )

  console.warn = warn
})

test('should warn when passed non-string children (number)', () => {
  const {error, warn} = console
  /** @type {unknown} */
  let message

  console.error = () => {}
  console.warn = (/** @type {unknown} */ d) => {
    message = d
  }

  // @ts-expect-error runtime
  assert.equal(asHtml(<Markdown children={1} />), '')
  assert.equal(
    message,
    '[react-markdown] Warning: please pass a string as `children` (not: `1`)'
  )

  console.error = error
  console.warn = warn
})

test('should warn when passed non-string children (boolean)', () => {
  const {error, warn} = console
  /** @type {unknown} */
  let message

  console.error = () => {}
  console.warn = (/** @type {unknown} */ d) => {
    message = d
  }

  // @ts-expect-error runtime
  assert.equal(asHtml(<Markdown children={false} />), '')
  assert.equal(
    message,
    '[react-markdown] Warning: please pass a string as `children` (not: `false`)'
  )

  console.error = error
  console.warn = warn
})

test('should not warn when passed `null` as children', () => {
  // @ts-expect-error: types do not allow `null`.
  assert.equal(asHtml(<Markdown children={null} />), '')
})

test('should not warn when passed `undefined` as children', () => {
  // @ts-expect-error: types do not allow `undefined`.
  assert.equal(asHtml(<Markdown children={undefined} />), '')
})

test('should warn when passed `allowDangerousHtml`', () => {
  const warn = console.warn
  /** @type {unknown} */
  let message

  console.warn = (/** @type {unknown} */ d) => {
    message = d
  }

  // @ts-expect-error runtime
  assert.equal(asHtml(<Markdown allowDangerousHtml>a</Markdown>), '<p>a</p>')
  assert.equal(
    message,
    '[react-markdown] Warning: please remove `allowDangerousHtml` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-buggy-html-in-markdown-parser> for more info)'
  )

  console.warn = warn
})

test('uses passed classname for root component', () => {
  assert.equal(
    asHtml(<Markdown className="md">Test</Markdown>),
    '<div class="md"><p>Test</p></div>'
  )
})

test('should handle multiple paragraphs properly', () => {
  const input = 'React is awesome\nAnd so is markdown\n\nCombining = epic'
  assert.equal(
    asHtml(<Markdown children={input} />),
    '<p>React is awesome\nAnd so is markdown</p>\n<p>Combining = epic</p>'
  )
})

test('should handle multiline paragraphs properly (softbreak, paragraphs)', () => {
  const input = 'React is awesome\nAnd so is markdown  \nCombining = epic'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>React is awesome\nAnd so is markdown<br/>\nCombining = epic</p>'
  )
})

test('should handle emphasis', () => {
  const input = 'React is _totally_ *awesome*'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(actual, '<p>React is <em>totally</em> <em>awesome</em></p>')
})

test('should handle bold/strong text', () => {
  const input = 'React is __totally__ **awesome**'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>React is <strong>totally</strong> <strong>awesome</strong></p>'
  )
})

test('should handle links without title attribute', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is <a href="https://espen.codes/">a link</a> to Espen.Codes.</p>'
  )
})

test('should handle links with title attribute', () => {
  const input =
    'This is [a link](https://espen.codes/ "some title") to Espen.Codes.'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is <a href="https://espen.codes/" title="some title">a link</a> to Espen.Codes.</p>'
  )
})

test('should handle links with uppercase protocol', () => {
  const input = 'This is [a link](HTTPS://ESPEN.CODES/) to Espen.Codes.'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is <a href="HTTPS://ESPEN.CODES/">a link</a> to Espen.Codes.</p>'
  )
})

test('should handle links with custom uri transformer', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const actual = asHtml(
    <Markdown
      children={input}
      transformLinkUri={(uri) => uri.replace(/^https?:/, '')}
    />
  )
  assert.equal(
    actual,
    '<p>This is <a href="//espen.codes/">a link</a> to Espen.Codes.</p>'
  )
})

test('should handle empty links with custom uri transformer', () => {
  const input = 'Empty: []()'

  const actual = asHtml(
    <Markdown
      children={input}
      transformLinkUri={(uri, _, title) => {
        assert.equal(uri, '', '`uri` should be an empty string')
        assert.equal(title, null, '`title` should be null')
        return ''
      }}
    />
  )

  assert.equal(actual, '<p>Empty: <a href=""></a></p>')
})

test('should handle titles of links', () => {
  const input = 'Empty: [](# "x")'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(actual, '<p>Empty: <a href="#" title="x"></a></p>')
})

test('should use target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const actual = asHtml(<Markdown children={input} linkTarget="_blank" />)
  assert.equal(
    actual,
    '<p>This is <a href="https://espen.codes/" target="_blank">a link</a> to Espen.Codes.</p>'
  )
})

test('should call function to get target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const actual = asHtml(
    <Markdown
      children={input}
      linkTarget={(uri) => (uri.startsWith('http') ? '_blank' : undefined)}
    />
  )
  assert.equal(
    actual,
    '<p>This is <a href="https://espen.codes/" target="_blank">a link</a> to Espen.Codes.</p>'
  )
})

test('should handle links with custom target transformer', () => {
  const input = 'Empty: []()'

  const actual = asHtml(
    <Markdown
      children={input}
      linkTarget={(uri, _, title) => {
        assert.equal(uri, '', '`uri` should be an empty string')
        assert.equal(title, null, '`title` should be null')
        return undefined
      }}
    />
  )

  assert.equal(actual, '<p>Empty: <a href=""></a></p>')
})

test('should handle links w/ titles with custom target transformer', () => {
  const input = 'Empty: [](a "b")'

  const actual = asHtml(
    <Markdown
      children={input}
      linkTarget={(_, _1, title) => {
        assert.equal(title, 'b', '`title` should be given')
        return undefined
      }}
    />
  )

  assert.equal(actual, '<p>Empty: <a href="a" title="b"></a></p>')
})

test('should support images without alt, url, or title', () => {
  const input = '![]()'
  const actual = asHtml(<Markdown children={input} transformLinkUri={null} />)
  const expected = '<p><img src="" alt=""/></p>'
  assert.equal(actual, expected)
})

test('should handle images without title attribute', () => {
  const input = 'This is ![an image](/ninja.png).'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(actual, '<p>This is <img src="/ninja.png" alt="an image"/>.</p>')
})

test('should handle images with title attribute', () => {
  const input = 'This is ![an image](/ninja.png "foo bar").'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is <img src="/ninja.png" alt="an image" title="foo bar"/>.</p>'
  )
})

test('should handle images with custom uri transformer', () => {
  const input = 'This is ![an image](/ninja.png).'
  const actual = asHtml(
    <Markdown
      children={input}
      transformImageUri={(uri) => uri.replace(/\.png$/, '.jpg')}
    />
  )
  assert.equal(actual, '<p>This is <img src="/ninja.jpg" alt="an image"/>.</p>')
})

test('should handle images with custom uri transformer', () => {
  const input = 'Empty: ![]()'
  const actual = asHtml(
    <Markdown
      children={input}
      transformImageUri={(uri, alt, title) => {
        assert.equal(uri, '', '`uri` should be an empty string')
        assert.equal(alt, '', '`alt` should be an empty string')
        assert.equal(title, null, '`title` should be null')
        return ''
      }}
    />
  )
  assert.equal(actual, '<p>Empty: <img src="" alt=""/></p>')
})

test('should handle images w/ titles with custom uri transformer', () => {
  const input = 'Empty: ![](a "b")'
  const actual = asHtml(
    <Markdown
      children={input}
      transformImageUri={(src, _1, title) => {
        assert.equal(title, 'b', '`title` should be passed')
        return src
      }}
    />
  )
  assert.equal(actual, '<p>Empty: <img src="a" alt="" title="b"/></p>')
})

test('should handle image references with custom uri transformer', () => {
  const input =
    'This is ![The Waffle Ninja][ninja].\n\n[ninja]: https://some.host/img.png'
  const actual = asHtml(
    <Markdown
      children={input}
      transformImageUri={(uri) => uri.replace(/\.png$/, '.jpg')}
    />
  )
  assert.equal(
    actual,
    '<p>This is <img src="https://some.host/img.jpg" alt="The Waffle Ninja"/>.</p>'
  )
})

test('should support images references without alt, url, or title', () => {
  const input = '![][a]\n\n[a]: <>'
  const actual = asHtml(<Markdown children={input} transformLinkUri={null} />)
  const expected = '<p><img src="" alt=""/></p>'
  assert.equal(actual, expected)
})

test('should handle images with special characters in alternative text', () => {
  const input = "This is ![a ninja's image](/ninja.png)."
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is <img src="/ninja.png" alt="a ninja&#x27;s image"/>.</p>'
  )
})

test('should be able to render headers', () => {
  assert.equal(asHtml(<Markdown children="# Awesome" />), '<h1>Awesome</h1>')
  assert.equal(asHtml(<Markdown children="## Awesome" />), '<h2>Awesome</h2>')
  assert.equal(asHtml(<Markdown children="### Awesome" />), '<h3>Awesome</h3>')
  assert.equal(asHtml(<Markdown children="#### Awesome" />), '<h4>Awesome</h4>')
  assert.equal(
    asHtml(<Markdown children="##### Awesome" />),
    '<h5>Awesome</h5>'
  )
})

test('should be able to render inline code', () => {
  const input = 'Just call `renderToStaticMarkup()`, already'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>Just call <code>renderToStaticMarkup()</code>, already</p>'
  )
})

test('should handle code tags without any language specification', () => {
  const input = "```\nvar foo = require('bar');\nfoo();\n```"
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<pre><code>var foo = require(&#x27;bar&#x27;);\nfoo();\n</code></pre>'
  )
})

test('should handle code tags with language specification', () => {
  const input = "```js\nvar foo = require('bar');\nfoo();\n```"
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<pre><code class="language-js">var foo = require(&#x27;bar&#x27;);\nfoo();\n</code></pre>'
  )
})

test('should only use first language definition on code blocks', () => {
  const input = "```js foo bar\nvar foo = require('bar');\nfoo();\n```"
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<pre><code class="language-js">var foo = require(&#x27;bar&#x27;);\nfoo();\n</code></pre>'
  )
})

test('should support character references in code blocks', () => {
  const input = `~~~js&#x0a;ololo&#x0a;i&#x0a;can&#x0a;haz&#x0a;class&#x0a;names&#x0a;!@#$%^&*()_
  woop
  ~~~`
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<pre><code class="language-js\nololo\ni\ncan\nhaz\nclass\nnames\n!@#$%^&amp;*()_">  woop\n</code></pre>'
  )
})

test('should handle code blocks by indentation', () => {
  const input = [
    '',
    '<footer class="footer">\n',
    '',
    '&copy; 2014 Foo Bar\n',
    '</footer>'
  ].join('    ')
  assert.equal(
    asHtml(<Markdown children={input} />),
    '<pre><code>&lt;footer class=&quot;footer&quot;&gt;\n    &amp;copy; 2014 Foo Bar\n&lt;/footer&gt;\n</code></pre>'
  )
})

test('should handle blockquotes', () => {
  const input = '> Moo\n> Tools\n> FTW\n'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(actual, '<blockquote>\n<p>Moo\nTools\nFTW</p>\n</blockquote>')
})

test('should handle nested blockquotes', () => {
  const input = [
    '> > Lots of ex-Mootoolers on the React team\n>\n',
    "> Totally didn't know that.\n>\n",
    "> > There's a reason why it turned out so awesome\n>\n",
    "> Haha I guess you're right!"
  ].join('')

  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<blockquote>\n<blockquote>\n<p>Lots of ex-Mootoolers on the React team</p>\n</blockquote>\n<p>Totally didn&#x27;t know that.</p>\n<blockquote>\n<p>There&#x27;s a reason why it turned out so awesome</p>\n</blockquote>\n<p>Haha I guess you&#x27;re right!</p>\n</blockquote>'
  )
})

test('should handle tight, unordered lists', () => {
  const input = '* Unordered\n* Lists\n* Are cool\n'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ul>\n<li>Unordered</li>\n<li>Lists</li>\n<li>Are cool</li>\n</ul>'
  )
})

test('should handle loose, unordered lists', () => {
  const input = '- foo\n\n- bar'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ul>\n<li>\n<p>foo</p>\n</li>\n<li>\n<p>bar</p>\n</li>\n</ul>'
  )
})

test('should handle tight, unordered lists with sublists', () => {
  const input = '* Unordered\n  * Lists\n    * Are cool\n'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ul>\n<li>Unordered\n<ul>\n<li>Lists\n<ul>\n<li>Are cool</li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>'
  )
})

test('should handle loose, unordered lists with sublists', () => {
  const input = '- foo\n\n  - bar'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ul>\n<li>\n<p>foo</p>\n<ul>\n<li>bar</li>\n</ul>\n</li>\n</ul>'
  )
})

test('should handle ordered lists', () => {
  const input = '1. Ordered\n2. Lists\n3. Are cool\n'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ol>\n<li>Ordered</li>\n<li>Lists</li>\n<li>Are cool</li>\n</ol>'
  )
})

test('should handle ordered lists with a start index', () => {
  const input = '7. Ordered\n8. Lists\n9. Are cool\n'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<ol start="7">\n<li>Ordered</li>\n<li>Lists</li>\n<li>Are cool</li>\n</ol>'
  )
})

test('should pass `ordered`, `depth`, `checked`, `index` to list/listItem', () => {
  const input = '- foo\n\n  2. bar\n  3. baz\n\n- root\n'
  const actual = asHtml(
    <Markdown
      children={input}
      components={{
        li({node, ordered, checked, index, ...props}) {
          assert.equal(typeof ordered, 'boolean')
          assert.equal(checked, null)
          assert.equal(index >= 0, true)
          return React.createElement('li', props)
        },
        ol({node, ordered, depth, ...props}) {
          assert.equal(ordered, true)
          assert.equal(depth >= 0, true)
          return React.createElement('ol', props)
        },
        ul({node, ordered, depth, ...props}) {
          assert.equal(ordered, false)
          assert.equal(depth >= 0, true)
          return React.createElement('ul', props)
        }
      }}
    />
  )

  assert.equal(
    actual,
    '<ul>\n<li>\n<p>foo</p>\n<ol start="2">\n<li>bar</li>\n<li>baz</li>\n</ol>\n</li>\n<li>\n<p>root</p>\n</li>\n</ul>'
  )
})

test('should pass `inline: true` to inline code', () => {
  const input = '```\na\n```\n\n\tb\n\n`c`'
  const actual = asHtml(
    <Markdown
      children={input}
      components={{
        code({node, inline, ...props}) {
          assert.equal(inline === undefined || inline === true, true)
          return React.createElement('code', props)
        }
      }}
    />
  )
  const expected =
    '<pre><code>a\n</code></pre>\n<pre><code>b\n</code></pre>\n<p><code>c</code></p>'
  assert.equal(actual, expected)
})

test('should pass `isHeader: boolean` to `tr`s', () => {
  const input = '| a |\n| - |\n| b |\n| c |'
  const actual = asHtml(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        tr({node, isHeader, ...props}) {
          assert.equal(typeof isHeader === 'boolean', true)
          return React.createElement('tr', props)
        }
      }}
    />
  )
  const expected =
    '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table>'
  assert.equal(actual, expected)
})

test('should pass `isHeader: true` to `th`s, `isHeader: false` to `td`s', () => {
  const input = '| a |\n| - |\n| b |\n| c |'
  const actual = asHtml(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        th({node, isHeader, ...props}) {
          assert.equal(isHeader, true)
          return React.createElement('th', props)
        },
        td({node, isHeader, ...props}) {
          assert.equal(isHeader, false)
          return React.createElement('td', props)
        }
      }}
    />
  )
  const expected =
    '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table>'
  assert.equal(actual, expected)
})

test('should pass `index: number`, `ordered: boolean`, `checked: boolean | null` to `li`s', () => {
  const input = '* [x] a\n* [ ] b\n* c'
  let count = 0
  const actual = asHtml(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        li({node, checked, index, ordered, ...props}) {
          assert.equal(index, count)
          assert.equal(ordered, false)
          assert.equal(checked, count === 0 ? true : count === 1 ? false : null)
          count++
          return React.createElement('li', props)
        }
      }}
    />
  )
  const expected =
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> a</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> b</li>\n<li>c</li>\n</ul>'
  assert.equal(actual, expected)
})

test('should pass `level: number` to `h1`, `h2`, ...', () => {
  const input = '#\n##\n###'

  /**
   * @param {object} props
   * @param {Element} props.node
   * @param {number} props.level
   */
  function heading({node, level, ...props}) {
    return React.createElement(`h${level}`, props)
  }

  const actual = asHtml(
    <Markdown
      children={input}
      components={{h1: heading, h2: heading, h3: heading}}
    />
  )
  const expected = '<h1></h1>\n<h2></h2>\n<h3></h3>'
  assert.equal(actual, expected)
})

test('should skip inline html with skipHtml option enabled', () => {
  const input = 'I am having <strong>so</strong> much fun'
  const actual = asHtml(<Markdown children={input} skipHtml />)
  assert.equal(actual, '<p>I am having so much fun</p>')
})

test('should escape html blocks by default', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is a regular paragraph.</p>\n&lt;table&gt;\n    &lt;tr&gt;\n        &lt;td&gt;Foo&lt;/td&gt;\n    &lt;/tr&gt;\n&lt;/table&gt;\n<p>This is another regular paragraph.</p>'
  )
})

test('should skip html blocks if skipHtml prop is set', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const actual = asHtml(<Markdown children={input} skipHtml />)
  assert.equal(
    actual,
    '<p>This is a regular paragraph.</p>\n\n<p>This is another regular paragraph.</p>'
  )
})

test('should escape html blocks by default (with HTML parser plugin)', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<p>This is a regular paragraph.</p>\n&lt;table&gt;\n    &lt;tr&gt;\n        &lt;td&gt;Foo&lt;/td&gt;\n    &lt;/tr&gt;\n&lt;/table&gt;\n<p>This is another regular paragraph.</p>'
  )
})

test('should handle horizontal rules', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const actual = asHtml(<Markdown children={input} />)
  assert.equal(actual, '<p>Foo</p>\n<hr/>\n<p>Bar</p>')
})

test('should set source position attributes if sourcePos option is enabled', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const actual = asHtml(<Markdown children={input} sourcePos />)
  assert.equal(
    actual,
    '<p data-sourcepos="1:1-1:4">Foo</p>\n<hr data-sourcepos="3:1-3:13"/>\n<p data-sourcepos="5:1-5:4">Bar</p>'
  )
})

test('should pass on raw source position to non-tag components if rawSourcePos option is enabled', () => {
  const input = '*Foo*\n\n------------\n\n__Bar__'
  const actual = asHtml(
    <Markdown
      children={input}
      rawSourcePos
      components={{
        em({node, sourcePosition, ...props}) {
          assert.equal(sourcePosition, {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 6, offset: 5}
          })
          return <em className="custom" {...props} />
        }
      }}
    />
  )

  assert.equal(
    actual,
    '<p><em class="custom">Foo</em></p>\n<hr/>\n<p><strong>Bar</strong></p>'
  )
})

test('should pass on raw source position to non-tag components if rawSourcePos option is enabled and `rehype-raw` is used', () => {
  const input = '*Foo*'
  asHtml(
    <Markdown
      children={input}
      rawSourcePos
      rehypePlugins={[raw]}
      components={{
        // @ts-expect-error JSX types currently only handle element returns not string returns
        em({sourcePosition}) {
          assert.equal(sourcePosition, {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 6, offset: 5}
          })
          return ''
        }
      }}
    />
  )
})

test('should skip nodes that are not defined as allowed', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2'
  const actual = asHtml(
    <Markdown children={input} allowedElements={['p', 'ol', 'li']} />
  )
  assert.equal(
    actual,
    '\n<p>Paragraph</p>\n\n<ol>\n<li>List item</li>\n<li>List item 2</li>\n</ol>'
  )
})

test('should skip nodes that are defined as disallowed', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const actual = asHtml(
    <Markdown children={input} disallowedElements={['li']} />
  )
  assert.equal(
    actual,
    '<h1>Header</h1>\n<p>Paragraph</p>\n<h2>New header</h2>\n<ol>\n\n\n</ol>\n<p>Foo</p>'
  )
})

test('should unwrap child nodes from disallowed nodes, if unwrapDisallowed option is enabled', () => {
  const input =
    'Espen *~~initiated~~ had the initial commit*, but has had several **contributors**'
  const actual = asHtml(
    <Markdown
      children={input}
      unwrapDisallowed
      disallowedElements={['em', 'strong']}
      remarkPlugins={[gfm]}
    />
  )
  assert.equal(
    actual,
    '<p>Espen <del>initiated</del> had the initial commit, but has had several contributors</p>'
  )
})

test('should render tables', () => {
  const input = [
    'Languages are fun, right?',
    '',
    '| ID  | English | Norwegian | Italian |',
    '| :-- | :-----: | --------: | ------- |',
    '| 1   | one     | en        | uno     |',
    '| 2   | two     | to        | due     |',
    '| 3   | three   | tre       | tre     |',
    ''
  ].join('\n')

  assert.equal(
    asHtml(<Markdown children={input} remarkPlugins={[gfm]} />),
    '<p>Languages are fun, right?</p>\n<table><thead><tr><th style="text-align:left">ID</th><th style="text-align:center">English</th><th style="text-align:right">Norwegian</th><th>Italian</th></tr></thead><tbody><tr><td style="text-align:left">1</td><td style="text-align:center">one</td><td style="text-align:right">en</td><td>uno</td></tr><tr><td style="text-align:left">2</td><td style="text-align:center">two</td><td style="text-align:right">to</td><td>due</td></tr><tr><td style="text-align:left">3</td><td style="text-align:center">three</td><td style="text-align:right">tre</td><td>tre</td></tr></tbody></table>'
  )
})

test('should render partial tables', () => {
  const input = 'User is writing a table by hand\n\n| Test | Test |\n|-|-|'

  assert.equal(
    asHtml(<Markdown children={input} remarkPlugins={[gfm]} />),
    '<p>User is writing a table by hand</p>\n<table><thead><tr><th>Test</th><th>Test</th></tr></thead></table>'
  )
})

test('should render link references', () => {
  const input = [
    'Stuff were changed in [1.1.4]. Check out the changelog for reference.',
    '',
    '[1.1.4]: https://github.com/remarkjs/react-markdown/compare/v1.1.3...v1.1.4'
  ].join('\n')

  assert.equal(
    asHtml(<Markdown children={input} />),
    '<p>Stuff were changed in <a href="https://github.com/remarkjs/react-markdown/compare/v1.1.3...v1.1.4">1.1.4</a>. Check out the changelog for reference.</p>'
  )
})

test('should render empty link references', () => {
  const input =
    'Stuff were changed in [][]. Check out the changelog for reference.'

  assert.equal(
    asHtml(<Markdown children={input} />),
    '<p>Stuff were changed in [][]. Check out the changelog for reference.</p>'
  )
})

test('should render image references', () => {
  const input = [
    'Checkout out this ninja: ![The Waffle Ninja][ninja]. Pretty neat, eh?',
    '',
    '[ninja]: /assets/ninja.png'
  ].join('\n')

  assert.equal(
    asHtml(<Markdown children={input} />),
    '<p>Checkout out this ninja: <img src="/assets/ninja.png" alt="The Waffle Ninja"/>. Pretty neat, eh?</p>'
  )
})

test('should render footnote with custom options', () => {
  const input = [
    'This is a statement[^1] with a citation.',
    '',
    '[^1]: This is a footnote for the citation.'
  ].join('\n')

  assert.equal(
    asHtml(
      <Markdown
        children={input}
        remarkPlugins={[gfm]}
        remarkRehypeOptions={{clobberPrefix: 'main-'}}
      />
    ),
    '<p>This is a statement<sup><a href="#main-fn-1" id="main-fnref-1" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup> with a citation.</p>\n<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>\n<ol>\n<li id="main-fn-1">\n<p>This is a footnote for the citation. <a href="#main-fnref-1" data-footnote-backref="true" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>'
  )
})

test('should support definitions with funky keys', () => {
  const input =
    '[][__proto__] and [][constructor]\n\n[__proto__]: a\n[constructor]: b'
  const actual = asHtml(<Markdown children={input} transformLinkUri={null} />)
  const expected = '<p><a href="a"></a> and <a href="b"></a></p>'
  assert.equal(actual, expected)
})

test('should support duplicate definitions', () => {
  const input = '[a][]\n\n[a]: b\n[a]: c'
  const actual = asHtml(<Markdown children={input} transformLinkUri={null} />)
  const expected = '<p><a href="b">a</a></p>'
  assert.equal(actual, expected)
})

test('should skip nodes that are defined as disallowed', () => {
  /** @type {Record<string, {input: string, shouldNotContain: string}>} */
  const samples = {
    p: {input: 'Paragraphs are cool', shouldNotContain: 'Paragraphs are cool'},
    h1: {input: '# Headers are neat', shouldNotContain: 'Headers are neat'},
    br: {input: 'Text  \nHardbreak', shouldNotContain: '<br/>'},
    a: {
      input: "[Espen's blog](http://espen.codes/) yeh?",
      shouldNotContain: '<a'
    },
    img: {input: 'Holy ![ninja](/ninja.png), batman', shouldNotContain: '<img'},
    em: {input: 'Many *contributors*', shouldNotContain: '<em'},
    code: {
      input: "```\nvar moo = require('bar');\nmoo();\n```",
      shouldNotContain: '<pre><code>'
    },
    blockquote: {
      input: '> Moo\n> Tools\n> FTW\n',
      shouldNotContain: '<blockquote'
    },
    ul: {input: '* A list\n*Of things', shouldNotContain: 'Of things'},
    li: {input: '* IPA\n*Imperial Stout\n', shouldNotContain: '<li'},
    strong: {input: "Don't **give up**, alright?", shouldNotContain: 'give up'},
    hr: {input: '\n-----\nAnd with that...', shouldNotContain: '<hr'}
  }

  /** @type {Array<string>} */
  const inputs = []
  /** @type {keyof samples} */
  let key

  for (key in samples) {
    if (own.call(samples, key)) {
      inputs.push(samples[key].input)
    }
  }

  const fullInput = inputs.join('\n')

  for (key in samples) {
    if (own.call(samples, key)) {
      const sample = samples[key]

      // Just to make sure, let ensure that the opposite is true
      assert.equal(
        asHtml(<Markdown children={fullInput} />).includes(
          sample.shouldNotContain
        ),
        true,
        'fixture should contain `' +
          sample.shouldNotContain +
          '` (`' +
          key +
          '`)'
      )

      assert.equal(
        asHtml(
          <Markdown children={fullInput} disallowedElements={[key]} />
        ).includes(sample.shouldNotContain),
        false,
        '`' +
          key +
          '` should not contain `' +
          sample.shouldNotContain +
          '` when disallowed'
      )
    }
  }
})

test('should throw if both allowed and disallowed types is specified', () => {
  assert.throws(() => {
    asHtml(
      <Markdown
        children=""
        allowedElements={['p']}
        disallowedElements={['a']}
      />
    )
  }, /only one of/i)
})

test('should be able to use a custom function to determine if the node should be allowed', () => {
  const input = [
    '# Header',
    '[react-markdown](https://github.com/remarkjs/react-markdown/) is a nice helper',
    'Also check out [my website](https://espen.codes/)'
  ].join('\n\n')

  assert.equal(
    asHtml(
      <Markdown
        children={input}
        allowElement={(element) =>
          element.tagName !== 'a' ||
          (element.properties &&
            typeof element.properties.href === 'string' &&
            element.properties.href.indexOf('https://github.com/') === 0)
        }
      />
    ),
    [
      '<h1>Header</h1>',
      '<p><a href="https://github.com/remarkjs/react-markdown/">react-markdown</a> is a nice helper</p>',
      '<p>Also check out </p>'
    ].join('\n')
  )
})

test('should be able to override components', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  /**
   * @param {number} level
   */
  const heading = (level) => {
    /**
     * @param {object} props
     * @param {Array<ReactNode>} props.children
     */
    const component = (props) => (
      <span className={`heading level-${level}`}>{props.children}</span>
    )
    return component
  }

  const actual = asHtml(
    <Markdown children={input} components={{h1: heading(1), h2: heading(2)}} />
  )

  assert.equal(
    actual,
    '<span class="heading level-1">Header</span>\n<p>Paragraph</p>\n<span class="heading level-2">New header</span>\n<ol>\n<li>List item</li>\n<li>List item 2</li>\n</ol>\n<p>Foo</p>'
  )
})

test('should throw on invalid component', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const components = {h1: 123}
  assert.throws(
    () =>
      // @ts-expect-error runtime
      asHtml(<Markdown children={input} components={components} />),
    /Component for name `h1`/
  )
})

test('can render the whole spectrum of markdown within a single run', async () => {
  const inputUrl = new URL('fixtures/runthrough.md', import.meta.url)
  const expectedUrl = new URL('fixtures/runthrough.html', import.meta.url)
  const input = String(await fs.readFile(inputUrl))
  const expected = String(await fs.readFile(expectedUrl))

  const actual = asHtml(
    <Markdown children={input} remarkPlugins={[gfm]} rehypePlugins={[raw]} />
  )

  assert.equal(actual, expected)
})

test('sanitizes certain dangerous urls for links by default', () => {
  const error = console.error

  console.error = () => {}

  const input = [
    '# [Much fun](javascript:alert("foo"))',
    "Can be had with [XSS links](vbscript:foobar('test'))",
    '> And [other](VBSCRIPT:bap) nonsense... [files](file:///etc/passwd) for instance',
    '## [Entities]( javascript&#x3A;alert("bazinga")) can be tricky, too',
    'Regular [links](https://foo.bar) must [be]() allowed',
    '[Some ref][xss]',
    '[xss]: javascript:alert("foo") "Dangerous stuff"',
    'Should allow [mailto](mailto:ex@ample.com) and [tel](tel:13133) links tho',
    'Also, [protocol-agnostic](//google.com) should be allowed',
    'local [paths](/foo/bar) should be [allowed](foo)',
    'allow [weird](?javascript:foo) query strings and [hashes](foo#vbscript:orders)'
  ].join('\n\n')

  const actual = asHtml(<Markdown children={input} />)
  assert.equal(
    actual,
    '<h1><a href="javascript:void(0)">Much fun</a></h1>\n<p>Can be had with <a href="javascript:void(0)">XSS links</a></p>\n<blockquote>\n<p>And <a href="javascript:void(0)">other</a> nonsense... <a href="javascript:void(0)">files</a> for instance</p>\n</blockquote>\n<h2><a href="javascript:void(0)">Entities</a> can be tricky, too</h2>\n<p>Regular <a href="https://foo.bar">links</a> must <a href="">be</a> allowed</p>\n<p><a href="javascript:void(0)" title="Dangerous stuff">Some ref</a></p>\n<p>Should allow <a href="mailto:ex@ample.com">mailto</a> and <a href="tel:13133">tel</a> links tho</p>\n<p>Also, <a href="//google.com">protocol-agnostic</a> should be allowed</p>\n<p>local <a href="/foo/bar">paths</a> should be <a href="foo">allowed</a></p>\n<p>allow <a href="?javascript:foo">weird</a> query strings and <a href="foo#vbscript:orders">hashes</a></p>'
  )

  console.error = error
})

test('allows specifying a custom URI-transformer', () => {
  const input =
    'Received a great [pull request](https://github.com/remarkjs/react-markdown/pull/15) today'
  const actual = asHtml(
    <Markdown
      children={input}
      transformLinkUri={(uri) => uri.replace(/^https?:\/\/github\.com\//i, '/')}
    />
  )
  assert.equal(
    actual,
    '<p>Received a great <a href="/remarkjs/react-markdown/pull/15">pull request</a> today</p>'
  )
})

test('should support turning off the default URI transform', () => {
  const input = '[a](data:text/html,<script>alert(1)</script>)'
  const actual = asHtml(<Markdown children={input} transformLinkUri={null} />)
  const expected =
    '<p><a href="data:text/html,%3Cscript%3Ealert(1)%3C/script%3E">a</a></p>'
  assert.equal(actual, expected)
})

test('can use parser plugins', () => {
  const input = 'a ~b~ c'
  const actual = asHtml(<Markdown children={input} remarkPlugins={[gfm]} />)
  assert.equal(actual, '<p>a <del>b</del> c</p>')
})

test('supports checkbox lists', () => {
  const input = '- [ ] Foo\n- [x] Bar\n\n---\n\n- Foo\n- Bar'
  const actual = asHtml(<Markdown children={input} remarkPlugins={[gfm]} />)
  assert.equal(
    actual,
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled=""/> Foo</li>\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> Bar</li>\n</ul>\n<hr/>\n<ul>\n<li>Foo</li>\n<li>Bar</li>\n</ul>'
  )
})

test('should pass index of a node under its parent to components if `includeElementIndex` option is enabled', () => {
  const input = 'Foo\n\nBar\n\nBaz'
  const actual = asHtml(
    <Markdown
      children={input}
      includeElementIndex
      components={{
        p({node, ...otherProps}) {
          assert.equal(typeof otherProps.index === 'number', true)
          return <p>{otherProps.children}</p>
        }
      }}
    />
  )
  assert.equal(actual, '<p>Foo</p>\n<p>Bar</p>\n<p>Baz</p>')
})

test('should be able to render components with forwardRef in HOC', () => {
  /**
   * @typedef {import('react').Ref<HTMLAnchorElement>} Ref
   * @typedef {JSX.IntrinsicElements['a'] & import('../lib/ast-to-react.js').ReactMarkdownProps} Props
   */

  /**
   * @param {(params: Props) => JSX.Element} Component
   */
  const wrapper = (Component) =>
    React.forwardRef(
      /**
       * @param {Props} props
       * @param {Ref} ref
       */
      (props, ref) => <Component ref={ref} {...props} />
    )

  /**
   * @param {Props} props
   */
  // eslint-disable-next-line react/jsx-no-target-blank
  const wrapped = (props) => <a {...props} />

  const actual = asHtml(
    <Markdown components={{a: wrapper(wrapped)}}>
      [Link](https://example.com/)
    </Markdown>
  )
  assert.equal(
    actual,
    '<p><a href="https://example.com/" node="[object Object]">Link</a></p>'
  )
})

test('should render table of contents plugin', () => {
  const input = [
    '# Header',
    '## Table of Contents',
    '## First Section',
    '## Second Section',
    '### Subsection',
    '## Third Section'
  ].join('\n')

  const actual = asHtml(<Markdown children={input} remarkPlugins={[toc]} />)
  assert.equal(
    actual,
    '<h1>Header</h1>\n<h2>Table of Contents</h2>\n<ul>\n<li>\n<p><a href="#first-section">First Section</a></p>\n</li>\n<li>\n<p><a href="#second-section">Second Section</a></p>\n<ul>\n<li><a href="#subsection">Subsection</a></li>\n</ul>\n</li>\n<li>\n<p><a href="#third-section">Third Section</a></p>\n</li>\n</ul>\n<h2>First Section</h2>\n<h2>Second Section</h2>\n<h3>Subsection</h3>\n<h2>Third Section</h2>'
  )
})

test('should pass `node` as prop to all non-tag/non-fragment components', () => {
  const input = "# So, *headers... they're _cool_*\n\n"
  const actual = asHtml(
    <Markdown
      children={input}
      components={{
        // @ts-expect-error JSX types currently only handle element returns not string returns
        h1(props) {
          let text = ''
          visit(props.node, 'text', (child) => {
            text += child.value
          })
          return text
        }
      }}
    />
  )
  assert.equal(actual, 'So, headers... they&#x27;re cool')
})

test('should support formatting at the start of a GFM tasklist (GH-494)', () => {
  const input = '- [ ] *a*'
  const actual = asHtml(<Markdown children={input} remarkPlugins={[gfm]} />)
  const expected =
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled=""/> <em>a</em></li>\n</ul>'
  assert.equal(actual, expected)
})

test('should support aria properties', () => {
  const input = 'c'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'input',
      properties: {id: 'a', ariaDescribedBy: 'b', required: true},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<input id="a" aria-describedby="b" required=""/><p>c</p>'
  assert.equal(actual, expected)
})

test('should support data properties', () => {
  const input = 'b'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {dataWhatever: 'a'},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<i data-whatever="a"></i><p>b</p>'
  assert.equal(actual, expected)
})

test('should support comma separated properties', () => {
  const input = 'c'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {accept: ['a', 'b']},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<i accept="a, b"></i><p>c</p>'
  assert.equal(actual, expected)
})

test('should support `style` properties', () => {
  const input = 'a'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: 'color: red; font-weight: bold'},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<i style="color:red;font-weight:bold"></i><p>a</p>'
  assert.equal(actual, expected)
})

test('should support `style` properties w/ vendor prefixes', () => {
  const input = 'a'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: '-ms-b: 1; -webkit-c: 2'},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<i style="-ms-b:1;-webkit-c:2"></i><p>a</p>'
  assert.equal(actual, expected)
})

test('should support broken `style` properties', () => {
  const input = 'a'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: 'broken'},
      children: []
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<i></i><p>a</p>'
  assert.equal(actual, expected)
})

test('should support SVG elements', () => {
  const input = 'a'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({
      type: 'element',
      tagName: 'svg',
      properties: {xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 500 500'},
      children: [
        {
          type: 'element',
          tagName: 'title',
          properties: {},
          children: [{type: 'text', value: 'SVG `<circle>` element'}]
        },
        {
          type: 'element',
          tagName: 'circle',
          properties: {cx: 120, cy: 120, r: 100},
          children: []
        },
        // `strokeMiterLimit` in hast, `strokeMiterlimit` in React.
        {
          type: 'element',
          tagName: 'path',
          properties: {strokeMiterLimit: -1},
          children: []
        }
      ]
    })
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><title>SVG `&lt;circle&gt;` element</title><circle cx="120" cy="120" r="100"></circle><path stroke-miterlimit="-1"></path></svg><p>a</p>'
  assert.equal(actual, expected)
})

test('should support (ignore) comments', () => {
  const input = 'a'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    root.children.unshift({type: 'comment', value: 'things!'})
  }

  const actual = asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  const expected = '<p>a</p>'
  assert.equal(actual, expected)
})

test('should support table cells w/ style', () => {
  const input = '| a  |\n| :- |'

  /** @type {import('unified').Plugin<Array<void>, Root>} */
  const plugin = () => (root) => {
    visit(root, {type: 'element', tagName: 'th'}, (node) => {
      node.properties = {...node.properties, style: 'color: red'}
    })
  }

  const actual = asHtml(
    <Markdown children={input} remarkPlugins={[gfm]} rehypePlugins={[plugin]} />
  )
  const expected =
    '<table><thead><tr><th style="color:red;text-align:left">a</th></tr></thead></table>'

  assert.equal(actual, expected)
})

test('should crash on a plugin replacing `root`', () => {
  const input = 'a'
  /** @type {import('unified').Plugin<Array<void>, Root>} */
  // @ts-expect-error: runtime.
  const plugin = () => () => ({type: 'comment', value: 'things!'})
  assert.throws(() => {
    asHtml(<Markdown children={input} rehypePlugins={[plugin]} />)
  }, /Expected a `root` node/)
})

test('should support remark plugins with array parameter', async () => {
  const error = console.error
  /** @type {string} */
  let message = ''

  console.error = (/** @type {string} */ d) => {
    message = d
  }

  const input = 'a'
  /** @type {import('unified').Plugin<Array<Array<string>>, Root>} */
  const plugin = () => () => {}

  const actual = asHtml(
    <Markdown children={input} remarkPlugins={[[plugin, ['foo', 'bar']]]} />
  )
  const expected = '<p>a</p>'
  assert.equal(actual, expected)

  assert.not.match(message, /Warning: Failed/, 'Prop types should be valid')
  console.error = error
})

test('should support rehype plugins with array parameter', async () => {
  const error = console.error
  /** @type {string} */
  let message = ''

  console.error = (/** @type {string} */ d) => {
    message = d
  }

  const input = 'a'
  /** @type {import('unified').Plugin<Array<Array<string>>, Root>} */
  const plugin = () => () => {}

  const actual = asHtml(
    <Markdown children={input} rehypePlugins={[[plugin, ['foo', 'bar']]]} />
  )
  const expected = '<p>a</p>'
  assert.equal(actual, expected)

  assert.not.match(message, /Warning: Failed/, 'Prop types should be valid')
  console.error = error
})

test.run()
