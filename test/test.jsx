/* @jsxRuntime automatic @jsxImportSource react */
/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('../lib/ast-to-react.js').HeadingProps} HeadingProps
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {renderToStaticMarkup} from 'react-dom/server'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import {visit} from 'unist-util-visit'
import Markdown from '../index.js'

test('react-markdown', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('../index.js')).sort(), [
      'default',
      'uriTransformer'
    ])
  })

  await t.test('should work', function () {
    assert.equal(asHtml(<Markdown>a</Markdown>), '<p>a</p>')
  })

  await t.test('should warn w/ `source`', function () {
    const warn = console.warn
    /** @type {unknown} */
    let message

    console.warn = capture

    // @ts-expect-error: check how the runtime handles untyped `source`.
    assert.equal(asHtml(<Markdown source="a">b</Markdown>), '<p>b</p>')
    assert.equal(
      message,
      '[react-markdown] Warning: please use `children` instead of `source` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#change-source-to-children> for more info)'
    )

    console.warn = warn

    /**
     * @param {unknown} d
     * @returns {undefined}
     */
    function capture(d) {
      message = d
    }
  })

  await t.test('should warn w/ non-string children (number)', function () {
    const {error, warn} = console
    /** @type {unknown} */
    let message

    console.error = function () {}
    console.warn = capture

    // @ts-expect-error: check how the runtime handles invalid `children`.
    assert.equal(asHtml(<Markdown children={1} />), '')
    assert.equal(
      message,
      '[react-markdown] Warning: please pass a string as `children` (not: `1`)'
    )

    console.error = error
    console.warn = warn

    /**
     * @param {unknown} d
     * @returns {undefined}
     */
    function capture(d) {
      message = d
    }
  })

  await t.test('should warn w/ non-string children (boolean)', function () {
    const {error, warn} = console
    /** @type {unknown} */
    let message

    console.error = function () {}
    console.warn = capture

    // @ts-expect-error: check how the runtime handles invalid `children`.
    assert.equal(asHtml(<Markdown children={false} />), '')
    assert.equal(
      message,
      '[react-markdown] Warning: please pass a string as `children` (not: `false`)'
    )

    console.error = error
    console.warn = warn

    /**
     * @param {unknown} d
     * @returns {undefined}
     */
    function capture(d) {
      message = d
    }
  })

  await t.test('should support `null` as children', function () {
    assert.equal(asHtml(<Markdown children={null} />), '')
  })

  await t.test('should support `undefined` as children', function () {
    assert.equal(asHtml(<Markdown children={undefined} />), '')
  })

  await t.test('should warn w/ `allowDangerousHtml`', function () {
    const warn = console.warn
    /** @type {unknown} */
    let message

    console.warn = capture

    // @ts-expect-error: check how the runtime handles deprecated `allowDangerousHtml`.
    assert.equal(asHtml(<Markdown allowDangerousHtml>a</Markdown>), '<p>a</p>')
    assert.equal(
      message,
      '[react-markdown] Warning: please remove `allowDangerousHtml` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-buggy-html-in-markdown-parser> for more info)'
    )

    console.warn = warn

    /**
     * @param {unknown} d
     * @returns {undefined}
     */
    function capture(d) {
      message = d
    }
  })

  await t.test('should support `className`', function () {
    assert.equal(
      asHtml(<Markdown className="md">a</Markdown>),
      '<div class="md"><p>a</p></div>'
    )
  })

  await t.test('should support a block quote', function () {
    assert.equal(
      asHtml(<Markdown children="> a" />),
      '<blockquote>\n<p>a</p>\n</blockquote>'
    )
  })

  await t.test('should support a break', function () {
    assert.equal(asHtml(<Markdown children={'a\\\nb'} />), '<p>a<br/>\nb</p>')
  })

  await t.test('should support a code (block, flow; indented)', function () {
    assert.equal(
      asHtml(<Markdown children="    a" />),
      '<pre><code>a\n</code></pre>'
    )
  })

  await t.test('should support a code (block, flow; fenced)', function () {
    assert.equal(
      asHtml(<Markdown children={'```js\na\n```'} />),
      '<pre><code class="language-js">a\n</code></pre>'
    )
  })

  await t.test('should support a delete (GFM)', function () {
    assert.equal(
      asHtml(<Markdown children="~a~" remarkPlugins={[remarkGfm]} />),
      '<p><del>a</del></p>'
    )
  })

  await t.test('should support an emphasis', function () {
    assert.equal(asHtml(<Markdown children="*a*" />), '<p><em>a</em></p>')
  })

  await t.test('should support a footnote (GFM)', function () {
    assert.equal(
      asHtml(
        <Markdown children={'a[^x]\n\n[^x]: y'} remarkPlugins={[remarkGfm]} />
      ),
      '<p>a<sup><a href="#user-content-fn-x" id="user-content-fnref-x" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>\n<ol>\n<li id="user-content-fn-x">\n<p>y <a href="#user-content-fnref-x" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support a heading', function () {
    assert.equal(asHtml(<Markdown children="# a" />), '<h1>a</h1>')
  })

  await t.test('should support an html (default)', function () {
    assert.equal(
      asHtml(<Markdown children="<i>a</i>" />),
      '<p>&lt;i&gt;a&lt;/i&gt;</p>'
    )
  })

  await t.test('should support an html (w/ `rehype-raw`)', function () {
    assert.equal(
      asHtml(<Markdown children="<i>a</i>" rehypePlugins={[rehypeRaw]} />),
      '<p><i>a</i></p>'
    )
  })

  await t.test('should support an image', function () {
    assert.equal(
      asHtml(<Markdown children="![a](b)" />),
      '<p><img src="b" alt="a"/></p>'
    )
  })

  await t.test('should support an image w/ a title', function () {
    assert.equal(
      asHtml(<Markdown children="![a](b (c))" />),
      '<p><img src="b" alt="a" title="c"/></p>'
    )
  })

  await t.test('should support an image reference / definition', function () {
    assert.equal(
      asHtml(<Markdown children={'![a]\n\n[a]: b'} />),
      '<p><img src="b" alt="a"/></p>'
    )
  })

  await t.test('should support code (text, inline)', function () {
    assert.equal(asHtml(<Markdown children="`a`" />), '<p><code>a</code></p>')
  })

  await t.test('should support a link', function () {
    assert.equal(
      asHtml(<Markdown children="[a](b)" />),
      '<p><a href="b">a</a></p>'
    )
  })

  await t.test('should support a link w/ a title', function () {
    assert.equal(
      asHtml(<Markdown children="[a](b (c))" />),
      '<p><a href="b" title="c">a</a></p>'
    )
  })

  await t.test('should support a link reference / definition', function () {
    assert.equal(
      asHtml(<Markdown children={'[a]\n\n[a]: b'} />),
      '<p><a href="b">a</a></p>'
    )
  })

  await t.test('should support prototype poluting identifiers', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={
            '[][__proto__] [][constructor]\n\n[__proto__]: a\n[constructor]: b'
          }
        />
      ),
      '<p><a href="a"></a> <a href="b"></a></p>'
    )
  })

  await t.test('should support duplicate definitions', function () {
    assert.equal(
      asHtml(<Markdown children={'[a][]\n\n[a]: b\n[a]: c'} />),
      '<p><a href="b">a</a></p>'
    )
  })

  await t.test('should support a list (unordered) / list item', function () {
    assert.equal(asHtml(<Markdown children="* a" />), '<ul>\n<li>a</li>\n</ul>')
  })

  await t.test('should support a list (ordered) / list item', function () {
    assert.equal(
      asHtml(<Markdown children="1. a" />),
      '<ol>\n<li>a</li>\n</ol>'
    )
  })

  await t.test('should support a paragraph', function () {
    assert.equal(asHtml(<Markdown children="a" />), '<p>a</p>')
  })

  await t.test('should support a strong', function () {
    assert.equal(
      asHtml(<Markdown children="**a**" />),
      '<p><strong>a</strong></p>'
    )
  })

  await t.test('should support a table (GFM)', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={'| a |\n| - |\n| b |'}
          remarkPlugins={[remarkGfm]}
        />
      ),
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>'
    )
  })

  await t.test('should support a table (GFM; w/ align)', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={'| a | b | c | d |\n| :- | :-: | -: | - |'}
          remarkPlugins={[remarkGfm]}
        />
      ),
      '<table><thead><tr><th style="text-align:left">a</th><th style="text-align:center">b</th><th style="text-align:right">c</th><th>d</th></tr></thead></table>'
    )
  })

  await t.test('should support a thematic break', function () {
    assert.equal(asHtml(<Markdown children="***" />), '<hr/>')
  })

  await t.test('should support ab absolute path', function () {
    assert.equal(
      asHtml(<Markdown children="[](/a)" />),
      '<p><a href="/a"></a></p>'
    )
  })

  await t.test('should support an absolute URL', function () {
    assert.equal(
      asHtml(<Markdown children="[](http://a.com)" />),
      '<p><a href="http://a.com"></a></p>'
    )
  })

  await t.test('should support a URL w/ uppercase protocol', function () {
    assert.equal(
      asHtml(<Markdown children="[](HTTPS://A.COM)" />),
      '<p><a href="HTTPS://A.COM"></a></p>'
    )
  })

  await t.test('should make a `javascript:` URL safe', function () {
    const consoleError = console.error
    console.error = noop
    assert.equal(
      asHtml(<Markdown children="[](javascript:alert(1))" />),
      '<p><a href="javascript:void(0)"></a></p>'
    )
    console.error = consoleError
  })

  await t.test('should make a `vbscript:` URL safe', function () {
    const consoleError = console.error
    console.error = noop
    assert.equal(
      asHtml(<Markdown children="[](vbscript:alert(1))" />),
      '<p><a href="javascript:void(0)"></a></p>'
    )
    console.error = consoleError
  })

  await t.test('should make a `VBSCRIPT:` URL safe', function () {
    const consoleError = console.error
    console.error = noop
    assert.equal(
      asHtml(<Markdown children="[](VBSCRIPT:alert(1))" />),
      '<p><a href="javascript:void(0)"></a></p>'
    )
    console.error = consoleError
  })

  await t.test('should make a `file:` URL safe', function () {
    const consoleError = console.error
    console.error = noop
    assert.equal(
      asHtml(<Markdown children="[](file:///etc/passwd)" />),
      '<p><a href="javascript:void(0)"></a></p>'
    )
    console.error = consoleError
  })

  await t.test('should allow an empty URL', function () {
    assert.equal(asHtml(<Markdown children="[]()" />), '<p><a href=""></a></p>')
  })

  await t.test('should support search (`?`) in a URL', function () {
    assert.equal(
      asHtml(<Markdown children="[](a?javascript:alert(1))" />),
      '<p><a href="a?javascript:alert(1)"></a></p>'
    )
  })

  await t.test('should support hash (`#`) in a URL', function () {
    assert.equal(
      asHtml(<Markdown children="[](a#javascript:alert(1))" />),
      '<p><a href="a#javascript:alert(1)"></a></p>'
    )
  })

  await t.test('should support `transformLinkUri`', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="[a](https://b.com 'c')"
          transformLinkUri={function (src, children, title) {
            assert.equal(src, 'https://b.com')
            assert.equal(children.length, 1)
            assert.equal(title, 'c')
            return ''
          }}
        />
      ),
      '<p><a href="" title="c">a</a></p>'
    )
  })

  await t.test('should support `transformLinkUri` w/ empty URLs', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="[]()"
          transformLinkUri={function (href, children, title) {
            assert.equal(href, '')
            assert.equal(children.length, 0)
            assert.equal(title, null)
            return ''
          }}
        />
      ),
      '<p><a href=""></a></p>'
    )
  })

  await t.test(
    'should support turning off `transformLinkUri` (dangerous)',
    function () {
      assert.equal(
        asHtml(
          <Markdown
            children="[](javascript:alert(1))"
            transformLinkUri={null}
          />
        ),
        '<p><a href="javascript:alert(1)"></a></p>'
      )
    }
  )

  await t.test('should support `transformImageUri`', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="![a](https://b.com 'c')"
          transformImageUri={function (src, alt, title) {
            assert.equal(src, 'https://b.com')
            assert.equal(alt, 'a')
            assert.equal(title, 'c')
            return ''
          }}
        />
      ),
      '<p><img src="" alt="a" title="c"/></p>'
    )
  })

  await t.test('should support `transformImageUri` w/ empty URLs', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="![]()"
          transformImageUri={function (href, alt, title) {
            assert.equal(href, '')
            assert.equal(alt, '')
            assert.equal(title, null)
            return ''
          }}
        />
      ),
      '<p><img src="" alt=""/></p>'
    )
  })

  await t.test(
    'should support turning off `transformImageUri` (dangerous)',
    function () {
      assert.equal(
        asHtml(
          <Markdown
            children="![](javascript:alert(1))"
            transformImageUri={null}
          />
        ),
        '<p><img src="javascript:alert(1)" alt=""/></p>'
      )
    }
  )

  await t.test('should support `skipHtml`', function () {
    const actual = asHtml(<Markdown children="a<i>b</i>c" skipHtml />)
    assert.equal(actual, '<p>abc</p>')
  })

  await t.test('should support `sourcePos`', function () {
    assert.equal(
      asHtml(<Markdown children="# *a*" sourcePos />),
      '<h1 data-sourcepos="1:1-1:6"><em data-sourcepos="1:3-1:6">a</em></h1>'
    )
  })

  await t.test(
    'should support `allowedElements` (drop unlisted nodes)',
    function () {
      assert.equal(
        asHtml(
          <Markdown
            children={'# *a*\n* b'}
            allowedElements={['h1', 'li', 'ul']}
          />
        ),
        '<h1></h1>\n<ul>\n<li>b</li>\n</ul>'
      )
    }
  )

  await t.test('should support `allowedElements` as a function', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="*a* **b**"
          allowElement={function (element) {
            return element.tagName !== 'em'
          }}
        />
      ),
      '<p> <strong>b</strong></p>'
    )
  })
  await t.test('should support `disallowedElements`', function () {
    assert.equal(
      asHtml(<Markdown children={'# *a*\n* b'} disallowedElements={['em']} />),
      '<h1></h1>\n<ul>\n<li>b</li>\n</ul>'
    )
  })

  await t.test(
    'should fail for both `allowedElements` and `disallowedElements`',
    function () {
      assert.throws(function () {
        asHtml(
          <Markdown
            children=""
            allowedElements={['p']}
            disallowedElements={['a']}
          />
        )
      }, /only one of/i)
    }
  )

  await t.test(
    'should support `unwrapDisallowed` w/ `allowedElements`',
    function () {
      assert.equal(
        asHtml(
          <Markdown
            children="# *a*"
            unwrapDisallowed
            allowedElements={['h1']}
          />
        ),
        '<h1>a</h1>'
      )
    }
  )

  await t.test(
    'should support `unwrapDisallowed` w/ `disallowedElements`',
    function () {
      assert.equal(
        asHtml(
          <Markdown
            children="# *a*"
            unwrapDisallowed
            disallowedElements={['em']}
          />
        ),
        '<h1>a</h1>'
      )
    }
  )

  await t.test('should support `remarkRehypeOptions`', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={'[^x]\n\n[^x]: a\n\n'}
          remarkPlugins={[remarkGfm]}
          remarkRehypeOptions={{clobberPrefix: 'b-'}}
        />
      ),
      '<p><sup><a href="#b-fn-x" id="b-fnref-x" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>\n<ol>\n<li id="b-fn-x">\n<p>a <a href="#b-fnref-x" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support `components`', function () {
    assert.equal(
      asHtml(<Markdown children="# a" components={{h1: 'h2'}} />),
      '<h2>a</h2>'
    )
  })

  await t.test('should support `components` as functions', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="a"
          components={{
            p(props) {
              const {node, ...rest} = props
              return <div {...rest} />
            }
          }}
        />
      ),
      '<div>a</div>'
    )
  })

  await t.test('should fail on invalid component', function () {
    assert.throws(function () {
      asHtml(
        <Markdown
          children="# a"
          components={{
            // @ts-expect-error: check how the runtime handles an invalid component.
            h1: 123
          }}
        />
      )
    }, /Component for name `h1`/)
  })

  await t.test('should support `null`, `undefined` in components', function () {
    assert.equal(
      asHtml(
        <Markdown
          children="# *a*"
          components={{
            // @ts-expect-error: code allows `null` but TS does not.
            h1: null,
            em: undefined
          }}
        />
      ),
      '<h1><em>a</em></h1>'
    )
  })

  await t.test('should support `components` (headings; `level`)', function () {
    let calls = 0

    assert.equal(
      asHtml(
        <Markdown
          children={'# a\n## b'}
          components={{h1: heading, h2: heading}}
        />
      ),
      '<h1>a</h1>\n<h2>b</h2>'
    )

    assert.equal(calls, 2)

    /**
     * @param {HeadingProps} props
     */
    function heading(props) {
      const {level, node, ...rest} = props
      assert.equal(typeof level, 'number')
      calls++
      const H = `h${level}`
      return <H {...rest} />
    }
  })

  await t.test('should support `components` (code; `inline`)', function () {
    let calls = 0
    assert.equal(
      asHtml(
        <Markdown
          children={'```\na\n```\n\n\tb\n\n`c`'}
          components={{
            code(props) {
              const {inline, node, ...rest} = props
              // To do: this should always be boolean on `code`?
              assert(inline === undefined || typeof inline === 'boolean')
              calls++
              return <code {...rest} />
            }
          }}
        />
      ),
      '<pre><code>a\n</code></pre>\n<pre><code>b\n</code></pre>\n<p><code>c</code></p>'
    )

    assert.equal(calls, 3)
  })

  await t.test(
    'should support `components` (li; `checked`, `index`, `ordered`)',
    function () {
      let calls = 0

      assert.equal(
        asHtml(
          <Markdown
            children={'* [x] a\n1. b'}
            components={{
              li(props) {
                const {checked, index, node, ordered, ...rest} = props
                assert.equal(typeof ordered, 'boolean')
                assert(checked === null || typeof checked === 'boolean')
                assert.equal(index >= 0, true)
                calls++
                return <li {...rest} />
              }
            }}
            remarkPlugins={[remarkGfm]}
          />
        ),
        '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> a</li>\n</ul>\n<ol>\n<li>b</li>\n</ol>'
      )

      assert.equal(calls, 2)
    }
  )

  await t.test(
    'should support `components` (ol; `depth`, `ordered`)',
    function () {
      let calls = 0

      assert.equal(
        asHtml(
          <Markdown
            children="1. a"
            components={{
              ol(props) {
                const {depth, node, ordered, ...rest} = props
                assert.equal(ordered, true)
                assert.equal(depth, 0)
                calls++
                return <ol {...rest} />
              }
            }}
          />
        ),
        '<ol>\n<li>a</li>\n</ol>'
      )

      assert.equal(calls, 1)
    }
  )

  await t.test(
    'should support `components` (ul; `depth`, `ordered`)',
    function () {
      let calls = 0

      assert.equal(
        asHtml(
          <Markdown
            children="* a"
            components={{
              ul(props) {
                const {depth, node, ordered, ...rest} = props
                assert.equal(ordered, false)
                assert.equal(depth, 0)
                calls++
                return <ul {...rest} />
              }
            }}
          />
        ),
        '<ul>\n<li>a</li>\n</ul>'
      )

      assert.equal(calls, 1)
    }
  )

  await t.test('should support `components` (tr; `isHeader`)', function () {
    let calls = 0

    assert.equal(
      asHtml(
        <Markdown
          children={'|a|\n|-|\n|b|'}
          components={{
            tr(props) {
              const {isHeader, node, ...rest} = props
              assert.equal(typeof isHeader, 'boolean')
              calls++
              return <tr {...rest} />
            }
          }}
          remarkPlugins={[remarkGfm]}
        />
      ),
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>'
    )

    assert.equal(calls, 2)
  })

  await t.test('should support `components` (td, th; `isHeader`)', function () {
    let tdCalls = 0
    let thCalls = 0

    assert.equal(
      asHtml(
        <Markdown
          children={'|a|\n|-|\n|b|'}
          components={{
            td(props) {
              const {isHeader, node, ...rest} = props
              assert.equal(isHeader, false)
              tdCalls++
              return <td {...rest} />
            },
            th(props) {
              const {isHeader, node, ...rest} = props
              assert.equal(isHeader, true)
              thCalls++
              return <th {...rest} />
            }
          }}
          remarkPlugins={[remarkGfm]}
        />
      ),
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>'
    )

    assert.equal(tdCalls, 1)
    assert.equal(thCalls, 1)
  })

  await t.test('should pass `node` to components', function () {
    let calls = 0
    assert.equal(
      asHtml(
        <Markdown
          children="*a*"
          components={{
            em(props) {
              const {node, ...rest} = props
              assert.deepEqual(node, {
                type: 'element',
                tagName: 'em',
                properties: {},
                children: [
                  {
                    type: 'text',
                    value: 'a',
                    position: {
                      start: {line: 1, column: 2, offset: 1},
                      end: {line: 1, column: 3, offset: 2}
                    }
                  }
                ],
                position: {
                  start: {line: 1, column: 1, offset: 0},
                  end: {line: 1, column: 4, offset: 3}
                }
              })
              calls++
              return <em {...rest} />
            }
          }}
        />
      ),
      '<p><em>a</em></p>'
    )

    assert.equal(calls, 1)
  })

  await t.test(
    'should support `rawSourcePos` (pass `sourcePosition` to components)',
    function () {
      let calls = 0
      assert.equal(
        asHtml(
          <Markdown
            children="*a*"
            rawSourcePos
            components={{
              em(props) {
                const {node, sourcePosition, ...rest} = props
                assert.deepEqual(sourcePosition, {
                  start: {line: 1, column: 1, offset: 0},
                  end: {line: 1, column: 4, offset: 3}
                })
                calls++
                return <em {...rest} />
              }
            }}
          />
        ),
        '<p><em>a</em></p>'
      )

      assert.equal(calls, 1)
    }
  )

  await t.test(
    'should support `includeElementIndex` (pass `index` to components)',
    function () {
      let calls = 0
      assert.equal(
        asHtml(
          <Markdown
            children="a"
            includeElementIndex
            components={{
              p(props) {
                const {index, node, ...rest} = props
                assert.equal(typeof index, 'number')
                calls++
                return <p>{rest.children}</p>
              }
            }}
          />
        ),
        '<p>a</p>'
      )
      assert.equal(calls, 1)
    }
  )

  await t.test('should support plugins (`remark-gfm`)', function () {
    assert.equal(
      asHtml(<Markdown children="a ~b~ c" remarkPlugins={[remarkGfm]} />),
      '<p>a <del>b</del> c</p>'
    )
  })

  await t.test('should support plugins (`remark-toc`)', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={'# a\n## Contents\n## b\n### c\n## d'}
          remarkPlugins={[remarkToc]}
        />
      ),
      `<h1>a</h1>
<h2>Contents</h2>
<ul>
<li><a href="#b">b</a>
<ul>
<li><a href="#c">c</a></li>
</ul>
</li>
<li><a href="#d">d</a></li>
</ul>
<h2>b</h2>
<h3>c</h3>
<h2>d</h2>`
    )
  })

  await t.test('should support aria properties', function () {
    assert.equal(
      asHtml(<Markdown children="c" rehypePlugins={[plugin]} />),
      '<input id="a" aria-describedby="b" required=""/><p>c</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'input',
          properties: {id: 'a', ariaDescribedBy: 'b', required: true},
          children: []
        })
      }
    }
  })

  await t.test('should support data properties', function () {
    assert.equal(
      asHtml(<Markdown children="b" rehypePlugins={[plugin]} />),
      '<i data-whatever="a"></i><p>b</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'i',
          properties: {dataWhatever: 'a', dataIgnoreThis: undefined},
          children: []
        })
      }
    }
  })

  await t.test('should support comma separated properties', function () {
    assert.equal(
      asHtml(<Markdown children="c" rehypePlugins={[plugin]} />),
      '<i accept="a, b"></i><p>c</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'i',
          properties: {accept: ['a', 'b']},
          children: []
        })
      }
    }
  })

  await t.test('should support `style` properties', function () {
    assert.equal(
      asHtml(<Markdown children="a" rehypePlugins={[plugin]} />),
      '<i style="color:red;font-weight:bold"></i><p>a</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'i',
          properties: {style: 'color: red; font-weight: bold'},
          children: []
        })
      }
    }
  })

  await t.test(
    'should support `style` properties w/ vendor prefixes',
    function () {
      assert.equal(
        asHtml(<Markdown children="a" rehypePlugins={[plugin]} />),
        '<i style="-ms-b:1;-webkit-c:2"></i><p>a</p>'
      )

      function plugin() {
        /**
         * @param {Root} tree
         * @returns {undefined}
         */
        return function (tree) {
          tree.children.unshift({
            type: 'element',
            tagName: 'i',
            properties: {style: '-ms-b: 1; -webkit-c: 2'},
            children: []
          })
        }
      }
    }
  )

  await t.test('should support broken `style` properties', function () {
    assert.equal(
      asHtml(<Markdown children="a" rehypePlugins={[plugin]} />),
      '<i></i><p>a</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'i',
          properties: {style: 'broken'},
          children: []
        })
      }
    }
  })

  await t.test('should support SVG elements', function () {
    assert.equal(
      asHtml(<Markdown children="a" rehypePlugins={[plugin]} />),
      '<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><title>SVG `&lt;circle&gt;` element</title><circle cx="120" cy="120" r="100"></circle><path stroke-miterlimit="-1"></path></svg><p>a</p>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({
          type: 'element',
          tagName: 'svg',
          properties: {
            viewBox: '0 0 500 500',
            xmlns: 'http://www.w3.org/2000/svg'
          },
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
    }
  })

  await t.test('should support comments (ignore them)', function () {
    const input = 'a'
    const actual = asHtml(
      <Markdown children={input} rehypePlugins={[plugin]} />
    )
    const expected = '<p>a</p>'
    assert.equal(actual, expected)

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        tree.children.unshift({type: 'comment', value: 'things!'})
      }
    }
  })

  await t.test('should support table cells w/ style', function () {
    assert.equal(
      asHtml(
        <Markdown
          children={'| a  |\n| :- |'}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[plugin]}
        />
      ),
      '<table><thead><tr><th style="color:red;text-align:left">a</th></tr></thead></table>'
    )

    function plugin() {
      /**
       * @param {Root} tree
       * @returns {undefined}
       */
      return function (tree) {
        visit(tree, 'element', function (node) {
          if (node.tagName === 'th') {
            node.properties = {...node.properties, style: 'color: red'}
          }
        })
      }
    }
  })

  await t.test('should fail on a plugin replacing `root`', function () {
    assert.throws(function () {
      asHtml(<Markdown children="a" rehypePlugins={[plugin]} />)
    }, /Expected a `root` node/)

    function plugin() {
      /**
       * @returns {Root}
       */
      return function () {
        // @ts-expect-error: check how non-roots are handled.
        return {type: 'comment', value: 'things!'}
      }
    }
  })
})

/**
 * @param {ReturnType<typeof Markdown>} input
 * @returns {string}
 */
function asHtml(input) {
  return renderToStaticMarkup(input)
}

/**
 * @returns {undefined}
 */
function noop() {}
