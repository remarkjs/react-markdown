const fs = require('fs')
const path = require('path')
const React = require('react')
const gfm = require('remark-gfm')
const visit = require('unist-util-visit')
const ReactDom = require('react-dom/server')
const renderer = require('react-test-renderer')
const remarkMath = require('remark-math')
const raw = require('rehype-raw')
const TeX = require('@matejmazur/react-katex')
const {render} = require('@testing-library/react')
const Markdown = require('../src/react-markdown.js')
const toc = require('remark-toc')

/**
 * @typedef {import('unist').Position} Position
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {import('react').ReactNode} ReactNode
 */

/**
 * @param {ReturnType<Markdown>} input
 * @returns {string}
 */
function renderHTML(input) {
  return ReactDom.renderToStaticMarkup(input)
}

test('can render the most basic of documents (single paragraph)', () => {
  const component = renderer.create(<Markdown>Test</Markdown>)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should warn when passed `source`', () => {
  const warn = console.warn
  console.warn = jest.fn()
  // @ts-ignore runtime
  expect(renderHTML(<Markdown source="a">b</Markdown>)).toEqual('<p>b</p>')
  expect(console.warn).toHaveBeenCalledWith(
    '[react-markdown] Warning: please use `children` instead of `source` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#change-source-to-children> for more info)'
  )
  console.warn = warn
})

test('should warn when passed non-string children (number)', () => {
  const {error, warn} = console
  console.error = jest.fn()
  console.warn = jest.fn()
  // @ts-ignore runtime
  expect(renderHTML(<Markdown children={1} />)).toEqual('')
  expect(console.warn).toHaveBeenCalledWith(
    '[react-markdown] Warning: please pass a string as `children` (not: `1`)'
  )
  console.error = error
  console.warn = warn
})

test('should warn when passed non-string children (boolean)', () => {
  const {error, warn} = console
  console.error = jest.fn()
  console.warn = jest.fn()
  // @ts-ignore runtime
  expect(renderHTML(<Markdown children={false} />)).toEqual('')
  expect(console.warn).toHaveBeenCalledWith(
    '[react-markdown] Warning: please pass a string as `children` (not: `false`)'
  )
  console.error = error
  console.warn = warn
})

test('should not warn when passed `null` as children', () => {
  expect(renderHTML(<Markdown children={null} />)).toEqual('')
})
test('should not warn when passed `undefined` as children', () => {
  expect(renderHTML(<Markdown children={undefined} />)).toEqual('')
})

test('should warn when passed `allowDangerousHtml`', () => {
  const warn = console.warn
  console.warn = jest.fn()
  // @ts-ignore runtime
  expect(renderHTML(<Markdown allowDangerousHtml>a</Markdown>)).toEqual(
    '<p>a</p>'
  )
  expect(console.warn).toHaveBeenCalledWith(
    '[react-markdown] Warning: please remove `allowDangerousHtml` (see <https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-buggy-html-in-markdown-parser> for more info)'
  )
  console.warn = warn
})

test('uses passed classname for root component', () => {
  const component = renderer.create(<Markdown className="md">Test</Markdown>)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle multiple paragraphs properly', () => {
  const input = 'React is awesome\nAnd so is markdown\n\nCombining = epic'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle multiline paragraphs properly (softbreak, paragraphs)', () => {
  const input = 'React is awesome\nAnd so is markdown  \nCombining = epic'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle emphasis', () => {
  const input = 'React is _totally_ *awesome*'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle bold/strong text', () => {
  const input = 'React is __totally__ **awesome**'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links without title attribute', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with title attribute', () => {
  const input =
    'This is [a link](https://espen.codes/ "some title") to Espen.Codes.'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with uppercase protocol', () => {
  const input = 'This is [a link](HTTPS://ESPEN.CODES/) to Espen.Codes.'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with custom uri transformer', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  /**
   * @param {string} uri
   * @returns {string}
   */
  const transform = (uri) => uri.replace(/^https?:/, '')
  const component = renderer.create(
    <Markdown children={input} transformLinkUri={transform} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle text with custom text transformer', () => {
  const input = 'Congratulations! **You won!**'
  /**
   * @param {string} text
   * @param {number} index
   * @returns {string|ReactNode}
   */
  const transform = (text, index) =>
    text.startsWith('Congratulations') ? (
      <span key={index} style={{color: 'red'}}>
        {text}
      </span>
    ) : (
      text
    )
  const component = renderer.create(
    <Markdown children={input} transformText={transform} />
  )

  expect(component.toJSON()).toMatchSnapshot()
})

test('should use target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const component = renderer.create(
    <Markdown children={input} linkTarget="_blank" />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should call function to get target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  /**
   * @param {string} uri
   * @returns {string}
   */
  const getTarget = (uri) => (uri.startsWith('http') ? '_blank' : undefined)
  const component = renderer.create(
    <Markdown children={input} linkTarget={getTarget} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should support images without alt, url, or title', () => {
  const input = '![]()'
  const actual = renderHTML(
    <Markdown children={input} transformLinkUri={null} />
  )
  const expected = '<p><img src="" alt=""/></p>'
  expect(actual).toEqual(expected)
})

test('should handle images without title attribute', () => {
  const input = 'This is ![an image](/ninja.png).'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images with title attribute', () => {
  const input = 'This is ![an image](/ninja.png "foo bar").'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images with custom uri transformer', () => {
  const input = 'This is ![an image](/ninja.png).'
  /**
   * @param {string} uri
   * @returns {string}
   */
  const transform = (uri) => uri.replace(/\.png$/, '.jpg')
  const component = renderer.create(
    <Markdown children={input} transformImageUri={transform} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle image references with custom uri transformer', () => {
  const input =
    'This is ![The Waffle Ninja][ninja].\n\n[ninja]: https://some.host/img.png'
  /**
   * @param {string} uri
   * @returns {string}
   */
  const transform = (uri) => uri.replace(/\.png$/, '.jpg')
  const component = renderer.create(
    <Markdown children={input} transformImageUri={transform} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should support images references without alt, url, or title', () => {
  const input = '![][a]\n\n[a]: <>'
  const actual = renderHTML(
    <Markdown children={input} transformLinkUri={null} />
  )
  const expected = '<p><img src="" alt=""/></p>'
  expect(actual).toEqual(expected)
})

test('should handle images with special characters in alternative text', () => {
  const input = "This is ![a ninja's image](/ninja.png)."
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render headers', () => {
  expect(renderHTML(<Markdown children="# Awesome" />)).toEqual(
    '<h1>Awesome</h1>'
  )
  expect(renderHTML(<Markdown children="## Awesome" />)).toEqual(
    '<h2>Awesome</h2>'
  )
  expect(renderHTML(<Markdown children="### Awesome" />)).toEqual(
    '<h3>Awesome</h3>'
  )
  expect(renderHTML(<Markdown children="#### Awesome" />)).toEqual(
    '<h4>Awesome</h4>'
  )
  expect(renderHTML(<Markdown children="##### Awesome" />)).toEqual(
    '<h5>Awesome</h5>'
  )
})

test('should be able to render inline code', () => {
  const input = 'Just call `renderToStaticMarkup()`, already'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code tags without any language specification', () => {
  const input = "```\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code tags with language specification', () => {
  const input = "```js\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should only use first language definition on code blocks', () => {
  const input = "```js foo bar\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should support character references in code blocks', () => {
  const input = `~~~js&#x0a;ololo&#x0a;i&#x0a;can&#x0a;haz&#x0a;class&#x0a;names&#x0a;!@#$%^&*()_
  woop
  ~~~`
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code blocks by indentation', () => {
  const input = [
    '',
    '<footer class="footer">\n',
    '',
    '&copy; 2014 Foo Bar\n',
    '</footer>'
  ].join('    ')
  expect(renderHTML(<Markdown children={input} />)).toMatchSnapshot()
})

test('should handle blockquotes', () => {
  const input = '> Moo\n> Tools\n> FTW\n'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle nested blockquotes', () => {
  const input = [
    '> > Lots of ex-Mootoolers on the React team\n>\n',
    "> Totally didn't know that.\n>\n",
    "> > There's a reason why it turned out so awesome\n>\n",
    "> Haha I guess you're right!"
  ].join('')

  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle tight, unordered lists', () => {
  const input = '* Unordered\n* Lists\n* Are cool\n'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle loose, unordered lists', () => {
  const input = '- foo\n\n- bar'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle tight, unordered lists with sublists', () => {
  const input = '* Unordered\n  * Lists\n    * Are cool\n'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle loose, unordered lists with sublists', () => {
  const input = '- foo\n\n  - bar'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle ordered lists', () => {
  const input = '1. Ordered\n2. Lists\n3. Are cool\n'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle ordered lists with a start index', () => {
  const input = '7. Ordered\n8. Lists\n9. Are cool\n'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass `ordered`, `depth`, `checked`, `index` to list/listItem', () => {
  const input = '- foo\n\n  2. bar\n  3. baz\n\n- root\n'
  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {boolean} props.ordered
   * @param {boolean} props.checked
   * @param {number} props.index
   */
  const li = ({node, ordered, checked, index, ...props}) => {
    expect(ordered).not.toBeUndefined()
    expect(checked).toBe(null)
    expect(index).toBeGreaterThanOrEqual(0)
    return React.createElement('li', props)
  }

  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {true} props.ordered
   * @param {number} props.depth
   */
  const ol = ({node, ordered, depth, ...props}) => {
    expect(ordered).toBe(true)
    expect(depth).toBeGreaterThanOrEqual(0)
    return React.createElement('ol', props)
  }

  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {false} props.ordered
   * @param {number} props.depth
   */
  const ul = ({node, ordered, depth, ...props}) => {
    expect(ordered).toBe(false)
    expect(depth).toBeGreaterThanOrEqual(0)
    return React.createElement('ul', props)
  }

  const component = renderer.create(
    <Markdown children={input} components={{li, ol, ul}} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass `inline: true` to inline code', () => {
  const input = '```\na\n```\n\n\tb\n\n`c`'
  const actual = renderHTML(
    <Markdown
      children={input}
      components={{
        /**
         * @param {Object} props
         * @param {Element} props.node
         * @param {boolean} [props.inline]
         */
        code({node, inline, ...props}) {
          expect(inline === undefined || inline === true).toBe(true)
          return React.createElement('code', props)
        }
      }}
    />
  )
  const expected =
    '<pre><code>a\n</code></pre>\n<pre><code>b\n</code></pre>\n<p><code>c</code></p>'
  expect(actual).toEqual(expected)
})

test('should pass `isHeader: boolean` to `tr`s', () => {
  const input = '| a |\n| - |\n| b |\n| c |'
  const actual = renderHTML(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        /**
         * @param {Object} props
         * @param {Element} props.node
         * @param {boolean} props.isHeader
         */
        tr({node, isHeader, ...props}) {
          expect(typeof isHeader === 'boolean').toBe(true)
          return React.createElement('tr', props)
        }
      }}
    />
  )
  const expected =
    '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table>'
  expect(actual).toEqual(expected)
})

test('should pass `isHeader: true` to `th`s, `isHeader: false` to `td`s', () => {
  const input = '| a |\n| - |\n| b |\n| c |'
  const actual = renderHTML(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        th({node, isHeader, ...props}) {
          expect(isHeader).toBe(true)
          return React.createElement('th', props)
        },
        td({node, isHeader, ...props}) {
          expect(isHeader).toBe(false)
          return React.createElement('td', props)
        }
      }}
    />
  )
  const expected =
    '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>b</td></tr><tr><td>c</td></tr></tbody></table>'
  expect(actual).toEqual(expected)
})

test('should pass `index: number`, `ordered: boolean`, `checked: boolean | null` to `li`s', () => {
  const input = '* [x] a\n* [ ] b\n* c'
  let count = 0
  const actual = renderHTML(
    <Markdown
      children={input}
      remarkPlugins={[gfm]}
      components={{
        li({node, checked, index, ordered, ...props}) {
          expect(index).toBe(count)
          expect(ordered).toBe(false)
          expect(checked).toBe(count === 0 ? true : count === 1 ? false : null)
          count++
          return React.createElement('li', props)
        }
      }}
    />
  )
  const expected =
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" checked="" disabled=""/> a</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> b</li>\n<li>c</li>\n</ul>'
  expect(actual).toEqual(expected)
})

test('should pass `level: number` to `h1`, `h2`, ...', () => {
  const input = '#\n##\n###'

  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {number} props.level
   */
  function heading({node, level, ...props}) {
    return React.createElement(`h${level}`, props)
  }

  const actual = renderHTML(
    <Markdown
      children={input}
      components={{h1: heading, h2: heading, h3: heading}}
    />
  )
  const expected = '<h1></h1>\n<h2></h2>\n<h3></h3>'
  expect(actual).toEqual(expected)
})

test('should skip inline html with skipHtml option enabled', () => {
  const input = 'I am having <strong>so</strong> much fun'
  const component = renderer.create(<Markdown children={input} skipHtml />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should escape html blocks by default', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip html blocks if skipHtml prop is set', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown children={input} skipHtml />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should escape html blocks by default (with HTML parser plugin)', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle horizontal rules', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should set source position attributes if sourcePos option is enabled', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const component = renderer.create(<Markdown children={input} sourcePos />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass on raw source position to non-tag components if rawSourcePos option is enabled', () => {
  const input = '*Foo*\n\n------------\n\n__Bar__'
  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {Position} [props.sourcePosition]
   */
  const em = ({node, sourcePosition, ...props}) => {
    expect(sourcePosition).toMatchSnapshot()
    return <em className="custom" {...props} />
  }

  const component = renderer.create(
    <Markdown children={input} rawSourcePos components={{em}} />
  )

  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass on raw source position to non-tag components if rawSourcePos option is enabled and `rehype-raw` is used', () => {
  const input = '*Foo*'
  /**
   * @param {Object} props
   * @param {Position} [props.sourcePosition]
   */
  const em = ({sourcePosition}) => {
    expect(sourcePosition).toMatchSnapshot()
    return ''
  }

  renderer.create(
    <Markdown
      children={input}
      rawSourcePos
      rehypePlugins={[raw]}
      components={{em}}
    />
  )
})

test('should skip nodes that are not defined as allowed', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2'
  const allowed = ['p', 'ol', 'li']
  const component = renderer.create(
    <Markdown children={input} allowedElements={allowed} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip nodes that are defined as disallowed', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const component = renderer.create(
    <Markdown children={input} disallowedElements={['li']} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should unwrap child nodes from disallowed nodes, if unwrapDisallowed option is enabled', () => {
  const input =
    'Espen *~~initiated~~ had the initial commit*, but has had several **contributors**'
  const component = renderer.create(
    <Markdown
      children={input}
      unwrapDisallowed
      disallowedElements={['em', 'strong']}
      remarkPlugins={[gfm]}
    />
  )
  expect(component.toJSON()).toMatchSnapshot()
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

  expect(
    renderHTML(<Markdown children={input} remarkPlugins={[gfm]} />)
  ).toMatchSnapshot()
})

test('should render partial tables', () => {
  const input = 'User is writing a table by hand\n\n| Test | Test |\n|-|-|'

  expect(
    renderHTML(<Markdown children={input} remarkPlugins={[gfm]} />)
  ).toMatchSnapshot()
})

test('should render link references', () => {
  const input = [
    'Stuff were changed in [1.1.4]. Check out the changelog for reference.',
    '',
    '[1.1.4]: https://github.com/remarkjs/react-markdown/compare/v1.1.3...v1.1.4'
  ].join('\n')

  expect(renderHTML(<Markdown children={input} />)).toMatchSnapshot()
})

test('should render empty link references', () => {
  const input =
    'Stuff were changed in [][]. Check out the changelog for reference.'

  expect(renderHTML(<Markdown children={input} />)).toMatchSnapshot()
})

test('should render image references', () => {
  const input = [
    'Checkout out this ninja: ![The Waffle Ninja][ninja]. Pretty neat, eh?',
    '',
    '[ninja]: /assets/ninja.png'
  ].join('\n')

  expect(renderHTML(<Markdown children={input} />)).toMatchSnapshot()
})

test('should support definitions with funky keys', () => {
  const input =
    '[][__proto__] and [][constructor]\n\n[__proto__]: a\n[constructor]: b'
  const actual = renderHTML(
    <Markdown children={input} transformLinkUri={null} />
  )
  const expected = '<p><a href="a"></a> and <a href="b"></a></p>'
  expect(actual).toEqual(expected)
})

test('should support duplicate definitions', () => {
  const input = '[a][]\n\n[a]: b\n[a]: c'
  const actual = renderHTML(
    <Markdown children={input} transformLinkUri={null} />
  )
  const expected = '<p><a href="b">a</a></p>'
  expect(actual).toEqual(expected)
})

describe('should skip nodes that are defined as disallowed', () => {
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

  const fullInput = Object.keys(samples)
    .map((/** @type {keyof samples} */ key) => samples[key].input)
    .join('\n')

  // eslint-disable-next-line unicorn/no-array-for-each
  Object.keys(samples).forEach((/** @type {keyof samples} */ key) => {
    test(key, () => {
      /** @type {samples[keyof samples]} */
      const sample = samples[key]

      expect(
        renderHTML(<Markdown children={fullInput} disallowedElements={[key]} />)
      ).not.toContain(sample.shouldNotContain)

      // Just for sanity's sake, let ensure that the opposite is true
      expect(renderHTML(<Markdown children={fullInput} />)).toContain(
        sample.shouldNotContain
      )
    })
  })
})

test('should throw if both allowed and disallowed types is specified', () => {
  expect(() => {
    renderHTML(
      <Markdown
        children=""
        allowedElements={['p']}
        disallowedElements={['a']}
      />
    )
  }).toThrow(/only one of/i)
})

test('should be able to use a custom function to determine if the node should be allowed', () => {
  const input = [
    '# Header',
    '[react-markdown](https://github.com/remarkjs/react-markdown/) is a nice helper',
    'Also check out [my website](https://espen.codes/)'
  ].join('\n\n')
  /**
   * @param {Element} element
   */
  const allow = (element) =>
    element.tagName !== 'a' ||
    (typeof element.properties.href === 'string' &&
      element.properties.href.indexOf('https://github.com/') === 0)

  expect(
    renderHTML(<Markdown children={input} allowElement={allow} />)
  ).toEqual(
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
     * @param {Object} props
     * @param {ReactNode[]} props.children
     */
    const component = (props) => (
      <span className={`heading level-${level}`}>{props.children}</span>
    )
    return component
  }

  const component = renderer.create(
    <Markdown children={input} components={{h1: heading(1), h2: heading(2)}} />
  )

  expect(component.toJSON()).toMatchSnapshot()
})

test('should throw on invalid component', () => {
  const input =
    '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const components = {h1: 123}
  expect(() =>
    // @ts-ignore runtime
    renderHTML(<Markdown children={input} components={components} />)
  ).toThrow(/Component for name `h1`/)
})

test('can render the whole spectrum of markdown within a single run', (done) => {
  fs.readFile(
    path.join(__dirname, 'fixtures', 'runthrough.md'),
    'utf8',
    (error, fixture) => {
      if (error) {
        done(error)
        return
      }

      const component = renderer.create(
        <Markdown
          children={fixture}
          remarkPlugins={[gfm]}
          rehypePlugins={[raw]}
        />
      )
      expect(component.toJSON()).toMatchSnapshot()
      done()
    }
  )
})

test('can render the whole spectrum of markdown within a single run (with html parser)', (done) => {
  fs.readFile(
    path.join(__dirname, 'fixtures', 'runthrough.md'),
    'utf8',
    (error, fixture) => {
      if (error) {
        done(error)
        return
      }

      const component = renderer.create(
        <Markdown
          children={fixture}
          remarkPlugins={[gfm]}
          rehypePlugins={[raw]}
        />
      )
      expect(component.toJSON()).toMatchSnapshot()
      done()
    }
  )
})

test('should support math', () => {
  /**
   * @param {Object} props
   * @param {Element} props.node
   */
  function handle({node, ...props}) {
    if (
      Array.isArray(node.properties.className) &&
      node.properties.className.includes('math')
    ) {
      if (!(node.children[0].type === 'text'))
        throw new TypeError('math is not text')
      return (
        // @ts-ignore broken types?
        <TeX
          block={!node.properties.className.includes('math-inline')}
          math={node.children[0].value}
        />
      )
    }

    return React.createElement(node.tagName, props)
  }

  const input =
    'Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.\n\n$$\nL = \\frac{1}{2} \\rho v^2 S C_L\n$$'

  const component = render(
    <Markdown
      children={input}
      remarkPlugins={[remarkMath]}
      components={{div: handle, span: handle}}
    />
  ).container.innerHTML

  expect(component).toMatchSnapshot()
})

test('sanitizes certain dangerous urls for links by default', () => {
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

  const component = renderer.create(<Markdown children={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('allows specifying a custom URI-transformer', () => {
  const input =
    'Received a great [pull request](https://github.com/remarkjs/react-markdown/pull/15) today'

  /**
   * @param {string} uri
   * @returns {string}
   */
  const transform = (uri) => uri.replace(/^https?:\/\/github\.com\//i, '/')
  const component = renderer.create(
    <Markdown children={input} transformLinkUri={transform} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should support turning off the default URI transform', () => {
  const input = '[a](data:text/html,<script>alert(1)</script>)'
  const actual = renderHTML(
    <Markdown children={input} transformLinkUri={null} />
  )
  const expected =
    '<p><a href="data:text/html,%3Cscript%3Ealert(1)%3C/script%3E">a</a></p>'
  expect(actual).toEqual(expected)
})

test('can use parser plugins', () => {
  const input = 'a ~b~ c'

  const component = renderer.create(
    <Markdown children={input} remarkPlugins={[gfm]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('supports checkbox lists', () => {
  const input = '- [ ] Foo\n- [x] Bar\n\n---\n\n- Foo\n- Bar'
  const component = renderer.create(
    <Markdown children={input} remarkPlugins={[gfm]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass index of a node under its parent to components if `includeElementIndex` option is enabled', () => {
  const input = 'Foo\n\nBar\n\nBaz'
  /**
   * @param {Object} props
   * @param {Element} props.node
   * @param {ReactNode[]} props.children
   */
  const p = ({node, ...otherProps}) => {
    expect(otherProps).toMatchSnapshot()
    return <p>{otherProps.children}</p>
  }

  const component = renderer.create(
    <Markdown children={input} includeElementIndex components={{p}} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render components with forwardRef in HOC', () => {
  /**
   * @param {Function} Component
   */
  const wrapper = (Component) => {
    return React.forwardRef((props, ref) => <Component ref={ref} {...props} />)
  }

  /**
   * @param {Object<string, unknown>} props
   */
  // eslint-disable-next-line react/jsx-no-target-blank
  const wrapped = (props) => <a {...props} />

  const component = renderer.create(
    <Markdown components={{a: wrapper(wrapped)}}>
      [Link](https://example.com/)
    </Markdown>
  )
  expect(component.toJSON()).toMatchSnapshot()
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

  const component = renderer.create(
    <Markdown children={input} remarkPlugins={[toc]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass `node` as prop to all non-tag/non-fragment components', () => {
  const input = "# So, *headers... they're _cool_*\n\n"

  /**
   * @param {Object} props
   * @param {Element} props.node
   */
  const h1 = (props) => {
    let text = ''
    visit(props.node, 'text', (/** @type {Text} */ child) => {
      text += child.value
    })
    return text
  }

  const component = renderer.create(
    <Markdown children={input} components={{h1}} />
  )
  expect(component.toJSON()).toBe("So, headers... they're cool")
})

test('should support formatting at the start of a GFM tasklist (GH-494)', () => {
  const input = '- [ ] *a*'
  const actual = renderHTML(<Markdown children={input} remarkPlugins={[gfm]} />)
  const expected =
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled=""/> <em>a</em></li>\n</ul>'
  expect(actual).toEqual(expected)
})

test('should support aria properties', () => {
  const input = 'c'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'input',
      properties: {id: 'a', ariaDescribedBy: 'b', required: true},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<input id="a" aria-describedby="b" required=""/><p>c</p>'
  expect(actual).toEqual(expected)
})

test('should support data properties', () => {
  const input = 'b'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {dataWhatever: 'a'},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<i data-whatever="a"></i><p>b</p>'
  expect(actual).toEqual(expected)
})

test('should support comma separated properties', () => {
  const input = 'c'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {accept: ['a', 'b']},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<i accept="a, b"></i><p>c</p>'
  expect(actual).toEqual(expected)
})

test('should support `style` properties', () => {
  const input = 'a'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: 'color: red; font-weight: bold'},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<i style="color:red;font-weight:bold"></i><p>a</p>'
  expect(actual).toEqual(expected)
})

test('should support `style` properties w/ vendor prefixes', () => {
  const input = 'a'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: '-ms-b: 1; -webkit-c: 2'},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<i style="-ms-b:1;-webkit-c:2"></i><p>a</p>'
  expect(actual).toEqual(expected)
})

test('should support broken `style` properties', () => {
  const input = 'a'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
      type: 'element',
      tagName: 'i',
      properties: {style: 'broken'},
      children: []
    })
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<i></i><p>a</p>'
  expect(actual).toEqual(expected)
})

test('should support SVG elements', () => {
  const input = 'a'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({
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

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><title>SVG `&lt;circle&gt;` element</title><circle cx="120" cy="120" r="100"></circle><path stroke-miterlimit="-1"></path></svg><p>a</p>'
  expect(actual).toEqual(expected)
})

test('should support (ignore) comments', () => {
  const input = 'a'
  const plugin = () => (/** @type {Root} */ tree) => {
    tree.children.unshift({type: 'comment', value: 'things!'})
  }

  const actual = renderHTML(
    <Markdown children={input} rehypePlugins={[plugin]} />
  )
  const expected = '<p>a</p>'
  expect(actual).toEqual(expected)
})

test('should support table cells w/ style', () => {
  const input = '| a  |\n| :- |'
  const plugin = () => (/** @type {Root} */ tree) => {
    visit(
      tree,
      {type: 'element', tagName: 'th'},
      (/** @type {Element} */ th) => {
        th.properties.style = 'color: red'
      }
    )
  }

  const actual = renderHTML(
    <Markdown children={input} remarkPlugins={[gfm]} rehypePlugins={[plugin]} />
  )
  const expected =
    '<table><thead><tr><th style="color:red;text-align:left">a</th></tr></thead></table>'

  expect(actual).toEqual(expected)
})

test('should crash on a plugin replacing `root`', () => {
  const input = 'a'
  const plugin = () => () => ({type: 'comment', value: 'things!'})
  expect(() =>
    renderHTML(<Markdown children={input} rehypePlugins={[plugin]} />)
  ).toThrow(/Expected a `root` node/)
})
