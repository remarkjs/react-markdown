/* eslint-env jest */
/* eslint-disable react/prop-types */
const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const fs = require('fs')
const path = require('path')
const React = require('react')
const breaks = require('remark-breaks')
const visit = require('unist-util-visit')
const ReactDom = require('react-dom/server')
const renderer = require('react-test-renderer')
const shortcodes = require('remark-shortcodes')
const htmlParser = require('../src/plugins/html-parser')
const Markdown = require('../src/react-markdown')
const MarkdownWithHtml = require('../src/with-html')

Enzyme.configure({adapter: new Adapter()})

const renderHTML = input => ReactDom.renderToStaticMarkup(input).replace(/^<div>|<\/div>$/g, '')

test('can render the most basic of documents (single paragraph)', () => {
  const component = renderer.create(<Markdown>Test</Markdown>)
  expect(component.toJSON()).toMatchSnapshot()
})

test('uses passed classname for root component', () => {
  const component = renderer.create(<Markdown className="md">Test</Markdown>)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle multiple paragraphs properly', () => {
  const input = 'React is awesome\nAnd so is markdown\n\nCombining = epic'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle multiline paragraphs properly (softbreak, paragraphs)', () => {
  const input = 'React is awesome\nAnd so is markdown  \nCombining = epic'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle emphasis', () => {
  const input = 'React is _totally_ *awesome*'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle bold/strong text', () => {
  const input = 'React is __totally__ **awesome**'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links without title attribute', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with title attribute', () => {
  const input = 'This is [a link](https://espen.codes/ "some title") to Espen.Codes.'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with uppercase protocol', () => {
  const input = 'This is [a link](HTTPS://ESPEN.CODES/) to Espen.Codes.'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle links with custom uri transformer', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const transform = uri => uri.replace(/^https?:/, '')
  const component = renderer.create(<Markdown transformLinkUri={transform} source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should use target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const component = renderer.create(<Markdown linkTarget="_blank" source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should call function to get target attribute for links if specified', () => {
  const input = 'This is [a link](https://espen.codes/) to Espen.Codes.'
  const getTarget = uri => (uri.match(/^http/) ? '_blank' : undefined)
  const component = renderer.create(<Markdown linkTarget={getTarget} source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images without title attribute', () => {
  const input = 'This is ![an image](/ninja.png).'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images with title attribute', () => {
  const input = 'This is ![an image](/ninja.png "foo bar").'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images with custom uri transformer', () => {
  const input = 'This is ![an image](/ninja.png).'
  const transform = uri => uri.replace(/\.png$/, '.jpg')
  const component = renderer.create(<Markdown transformImageUri={transform} source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle image references with custom uri transformer', () => {
  const input = 'This is ![The Waffle Ninja][ninja].\n\n[ninja]: https://some.host/img.png'
  const transform = uri => uri.replace(/\.png$/, '.jpg')
  const component = renderer.create(<Markdown transformImageUri={transform} source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle images with special characters in alternative text', () => {
  const input = "This is ![a ninja's image](/ninja.png)."
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render headers', () => {
  expect(renderHTML(<Markdown source={'# Awesome'} />)).toEqual('<h1>Awesome</h1>')
  expect(renderHTML(<Markdown source={'## Awesome'} />)).toEqual('<h2>Awesome</h2>')
  expect(renderHTML(<Markdown source={'### Awesome'} />)).toEqual('<h3>Awesome</h3>')
  expect(renderHTML(<Markdown source={'#### Awesome'} />)).toEqual('<h4>Awesome</h4>')
  expect(renderHTML(<Markdown source={'##### Awesome'} />)).toEqual('<h5>Awesome</h5>')
})

test('should be able to render inline code', () => {
  const input = 'Just call `renderToStaticMarkup()`, already'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code tags without any language specification', () => {
  const input = "```\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code tags with language specification', () => {
  const input = "```js\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should only use first language definition on code blocks', () => {
  const input = "```js foo bar\nvar foo = require('bar');\nfoo();\n```"
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should sanititize language strings in code blocks', () => {
  const input = `~~~js&#x0a;ololo&#x0a;i&#x0a;can&#x0a;haz&#x0a;class&#x0a;names&#x0a;!@#$%^&*()_
  woop
  ~~~`
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle code blocks by indentation', () => {
  const input = ['', '<footer class="footer">\n', '', '&copy; 2014 Foo Bar\n', '</footer>'].join(
    '    '
  )
  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

test('should handle blockquotes', () => {
  const input = '> Moo\n> Tools\n> FTW\n'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle nested blockquotes', () => {
  const input = [
    '> > Lots of ex-Mootoolers on the React team\n>\n',
    "> Totally didn't know that.\n>\n",
    "> > There's a reason why it turned out so awesome\n>\n",
    "> Haha I guess you're right!"
  ].join('')

  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle tight, unordered lists', () => {
  const input = '* Unordered\n* Lists\n* Are cool\n'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle loose, unordered lists', () => {
  const input = '- foo\n\n- bar'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle tight, unordered lists with sublists', () => {
  const input = '* Unordered\n  * Lists\n    * Are cool\n'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle loose, unordered lists with sublists', () => {
  const input = '- foo\n\n  - bar'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle ordered lists', () => {
  const input = '1. Ordered\n2. Lists\n3. Are cool\n'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle ordered lists with a start index', () => {
  const input = '7. Ordered\n8. Lists\n9. Are cool\n'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass depth, index and ordered props to list/listItem', () => {
  const input = '- foo\n\n  2. bar\n  3. baz\n\n- root\n'
  const renderers = {
    listItem: item => {
      expect(item.index).toBeGreaterThanOrEqual(0)
      expect(item.ordered).not.toBeUndefined()
      return Markdown.renderers.listItem(item)
    },
    list: item => {
      expect(item.depth).toBeGreaterThanOrEqual(0)
      return Markdown.renderers.list(item)
    }
  }
  const component = renderer.create(<Markdown source={input} renderers={renderers} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle inline html with escapeHtml option enabled', () => {
  const input = 'I am having <strong>so</strong> much fun'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render basic inline html without containers', () => {
  const input = 'I am having <strong>so</strong> much fun'
  const component = renderer.create(<Markdown source={input} escapeHtml={false} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html in totally unsatisfying, weird ways', () => {
  const input = 'I am having <span class="foo">so</span> much fun'
  const component = renderer.create(<Markdown source={input} escapeHtml={false} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html properly with HTML parser plugin', () => {
  const input = 'I am having <span class="foo">so</span> much fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html properly with HTML parser plugin (through require)', () => {
  const input = 'I am having <span class="foo">so</span> much fun'
  const component = renderer.create(<MarkdownWithHtml source={input} escapeHtml={false} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html with nested markdown properly with HTML parser plugin', () => {
  const input = 'I am having <span class="foo">*so*</span> much fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html with self-closing tags properly with HTML parser plugin', () => {
  const input = 'I am having <wbr/> so much fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html with self-closing tags with attributes properly with HTML parser plugin', () => {
  const input = 'I am having <wbr class="foo"/> so much fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render inline html with self-closing tags with attributes properly with HTML parser plugin (#2)', () => {
  const input = 'I am having <wbr class="foo"/> so much fun'
  Enzyme.mount(<Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />)
})

test('should be able to render multiple inline html elements with self-closing tags with attributes properly with HTML parser plugin', () => {
  const input = 'I am having <wbr class="foo"/> so much <wbr class="bar"/> fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render a table with a single child with HTML parser plugin', () => {
  const input = '<table><tbody><tr><td>I am having so much fun</td></tr></tbody></table>'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render a table with multiple children with HTML parser plugin', () => {
  const input =
    '<table><thead><tr><th>Title</th></tr></thead><tbody><tr><td>I am having so much fun</td></tr></tbody></table>'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to render replaced non-void html elements with HTML parser plugin', () => {
  const input = 'I am having <code>so much</code> fun'
  const config = {
    isValidNode: () => true,
    processingInstructions: [
      {
        shouldProcessNode: ({name}) => name === 'code',
        // eslint-disable-next-line react/display-name
        processNode: (node, children) => <kbd>{children}</kbd>
      }
    ]
  }
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser(config)]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle invalid HTML with HTML parser plugin', () => {
  const input = 'I am having <div> so much</em> fun'
  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip inline html with skipHtml option enabled', () => {
  const input = 'I am having <strong>so</strong> much fun'
  const component = renderer.create(<Markdown source={input} skipHtml />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle html blocks', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown source={input} escapeHtml={false} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should escape html blocks by default', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip html blocks if skipHtml prop is set', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown source={input} escapeHtml={false} skipHtml />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip html blocks if skipHtml prop is set (with HTML parser plugin)', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} skipHtml astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should escape html blocks if escapeHtml prop is set (with HTML parser plugin)', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(
    <Markdown source={input} escapeHtml astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should escape html blocks by default (with HTML parser plugin)', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(<Markdown source={input} astPlugins={[htmlParser()]} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle html blocks with HTML parser plugin', () => {
  const input = [
    'This is a regular paragraph.\n\n<table>\n    <tr>\n        ',
    '<td>Foo</td>\n    </tr>\n</table>\n\nThis is another',
    ' regular paragraph.'
  ].join('')

  const component = renderer.create(
    <Markdown source={input} escapeHtml={false} astPlugins={[htmlParser()]} />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should handle horizontal rules', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should set source position attributes if sourcePos option is enabled', () => {
  const input = 'Foo\n\n------------\n\nBar'
  const component = renderer.create(<Markdown source={input} sourcePos />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass on raw source position to non-tag renderers if rawSourcePos option is enabled', () => {
  const input = '*Foo*\n\n------------\n\n__Bar__'
  const emphasis = props => {
    expect(props.sourcePosition).toMatchSnapshot()
    return <em className="custom">{props.children}</em>
  }
  const component = renderer.create(<Markdown source={input} renderers={{emphasis}} rawSourcePos />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip nodes that are not defined as allowed', () => {
  const input = '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2'
  const allowed = ['paragraph', 'list', 'listItem', 'text']
  const component = renderer.create(<Markdown source={input} allowedTypes={allowed} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should skip nodes that are defined as disallowed', () => {
  const input = '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const component = renderer.create(<Markdown source={input} disallowedTypes={['listItem']} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should unwrap child nodes from disallowed nodes, if unwrapDisallowed option is enabled', () => {
  const input = 'Espen *~~initiated~~ had the initial commit*, but has had several **contributors**'
  const component = renderer.create(
    <Markdown source={input} disallowedTypes={['emphasis', 'strong']} unwrapDisallowed />
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

  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

test('should render partial tables', () => {
  const input = ['User is writing a table by hand', '', '| Test | Test |', '|------|', ''].join(
    '\n'
  )

  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

test('should render link references', () => {
  const input = [
    'Stuff were changed in [1.1.4]. Check out the changelog for reference.',
    '',
    '[1.1.4]: https://github.com/rexxars/react-markdown/compare/v1.1.3...v1.1.4'
  ].join('\n')

  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

test('should render empty link references', () => {
  const input = 'Stuff were changed in [][]. Check out the changelog for reference.'

  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

test('should render image references', () => {
  const input = [
    'Checkout out this ninja: ![The Waffle Ninja][ninja]. Pretty neat, eh?',
    '',
    '[ninja]: /assets/ninja.png'
  ].join('\n')

  expect(renderHTML(<Markdown source={input} />)).toMatchSnapshot()
})

describe('should skip nodes that are defined as disallowed', () => {
  const samples = {
    html: {input: 'Foo<kbd>bar</kbd>', shouldNotContain: '<kbd>'},
    paragraph: {input: 'Paragraphs are cool', shouldNotContain: 'Paragraphs are cool'},
    heading: {input: '# Headers are neat', shouldNotContain: 'Headers are neat'},
    break: {input: 'Text  \nHardbreak', shouldNotContain: '<br/>'},
    link: {input: "[Espen's blog](http://espen.codes/) yeh?", shouldNotContain: '<a'},
    image: {input: 'Holy ![ninja](/ninja.png), batman', shouldNotContain: '<img'},
    emphasis: {input: 'Many *contributors*', shouldNotContain: '<em'},
    inlineCode: {input: 'Yeah, `renderToStaticMarkup()`', shouldNotContain: 'renderToStaticMarkup'},
    code: {input: "```\nvar moo = require('bar');\nmoo();\n```", shouldNotContain: '<pre><code>'},
    blockquote: {input: '> Moo\n> Tools\n> FTW\n', shouldNotContain: '<blockquote'},
    list: {input: '* A list\n*Of things', shouldNotContain: 'Of things'},
    listItem: {input: '* IPA\n*Imperial Stout\n', shouldNotContain: '<li'},
    strong: {input: "Don't **give up**, alright?", shouldNotContain: 'give up'},
    thematicBreak: {input: '\n-----\nAnd with that...', shouldNotContain: '<hr'}
  }

  const fullInput = Object.keys(samples).reduce((input, sampleType) => {
    return `${input + samples[sampleType].input}\n`
  }, '')

  Object.keys(samples).forEach(type => {
    test(type, () => {
      const sample = samples[type]

      expect(
        renderHTML(<Markdown source={fullInput} disallowedTypes={[type]} escapeHtml={false} />)
      ).not.toContain(sample.shouldNotContain)

      // Just for sanity's sake, let ensure that the opposite is true
      expect(renderHTML(<Markdown escapeHtml={false} source={fullInput} />)).toContain(
        sample.shouldNotContain
      )
    })
  })
})

test('should throw if html parser is used without config', () => {
  expect(() => {
    renderHTML(<Markdown source="" astPlugins={[htmlParser]} />)
  }).toThrow(/called before use/i)
})

test('should throw if both allowed and disallowed types is specified', () => {
  expect(() => {
    renderHTML(<Markdown source="" allowedTypes={['paragraph']} disallowedTypes={['link']} />)
  }).toThrow(/Only one of/i)
})

test('should be able to use a custom function to determine if the node should be allowed', () => {
  const input = [
    '# Header',
    '[react-markdown](https://github.com/rexxars/react-markdown/) is a nice helper',
    'Also check out [my website](https://espen.codes/)'
  ].join('\n\n')
  const allow = node => node.type !== 'link' || node.url.indexOf('https://github.com/') === 0

  expect(renderHTML(<Markdown allowNode={allow} source={input} />)).toEqual(
    [
      '<h1>Header</h1>',
      '<p><a href="https://github.com/rexxars/react-markdown/">react-markdown</a> is a nice helper</p>',
      '<p>Also check out </p>'
    ].join('')
  )
})

test('should be able to override renderers', () => {
  const input = '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const heading = props => <span className={`heading level-${props.level}`}>{props.children}</span>
  const component = renderer.create(<Markdown source={input} renderers={{heading: heading}} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should throw on invalid renderer', () => {
  const input = '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const renderers = {heading: 123}
  expect(() => renderHTML(<Markdown source={input} renderers={renderers} />)).toThrow(
    /Renderer for type `heading`/
  )
})

test('should be able to override root renderer with fragment renderer', () => {
  const input = '# Header\n\nfoo'
  const root = React.Fragment
  const component = renderer.create(<Markdown source={input} renderers={{root}} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('can render the whole spectrum of markdown within a single run', done => {
  fs.readFile(path.join(__dirname, 'fixtures', 'runthrough.md'), 'utf8', (err, fixture) => {
    if (err) {
      done(err)
      return
    }

    const component = renderer.create(<Markdown source={fixture} escapeHtml={false} />)
    expect(component.toJSON()).toMatchSnapshot()
    done()
  })
})

test('can render the whole spectrum of markdown within a single run (with html parser)', done => {
  fs.readFile(path.join(__dirname, 'fixtures', 'runthrough.md'), 'utf8', (err, fixture) => {
    if (err) {
      done(err)
      return
    }

    const component = renderer.create(<MarkdownWithHtml source={fixture} escapeHtml={false} />)
    expect(component.toJSON()).toMatchSnapshot()
    done()
  })
})

test('passes along all props when the node type is unknown', () => {
  expect.assertions(3)

  const ShortcodeRenderer = props => {
    expect(props.identifier).toBe('GeoMarker')
    expect(props.attributes).toEqual({lat: '59.924082', lng: '10.758460', title: 'Sanity'})
    return <div>{props.attributes.title}</div>
  }

  const input = 'Paragraph\n\n[[ GeoMarker lat="59.924082" lng="10.758460" title="Sanity" ]]'
  const component = renderer.create(
    <Markdown
      source={input}
      plugins={[shortcodes]}
      renderers={{shortcode: ShortcodeRenderer}}
      escapeHtml={false}
    />
  )

  expect(component.toJSON()).toMatchSnapshot()
})

test('can match and reactify cheap/simple inline html', () => {
  const input = 'So <ins>arbitrary *tags* wont</ins> just work.'
  expect(renderHTML(<Markdown source={input} escapeHtml={false} />)).toEqual(
    '<p>So <ins>arbitrary <em>tags</em> wont</ins> just work.</p>'
  )
})

test('can match multiple simple inline tags', () => {
  const input = 'So <ins>arbitrary</ins> <em>things</em>?'
  expect(renderHTML(<Markdown source={input} escapeHtml={false} />)).toEqual(
    '<p>So <ins>arbitrary</ins> <em>things</em>?</p>'
  )
})

test('can match nested simple inline tags', () => {
  const input = 'So <ins>arbitrary <em>things</em> are cool</ins>?'
  expect(renderHTML(<Markdown source={input} escapeHtml={false} />)).toEqual(
    '<p>So <ins>arbitrary <em>things</em> are cool</ins>?</p>'
  )
})

test('can match and reactify self-closing, attributeless html', () => {
  const input = 'Can I insert a horizontal rule?\n\n<hr />\n\nYup, looks like it.'
  expect(renderHTML(<Markdown source={input} escapeHtml={false} />)).toEqual(
    '<p>Can I insert a horizontal rule?</p><hr/><p>Yup, looks like it.</p>'
  )
})

test('can match and reactify self-closing, attributeless html (whitelist)', () => {
  const input = 'Can I insert a horizontal rule?\n\n<hr>\n\nYup, looks like it.'
  expect(renderHTML(<Markdown source={input} escapeHtml={false} />)).toEqual(
    '<p>Can I insert a horizontal rule?</p><hr/><p>Yup, looks like it.</p>'
  )
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

  const component = renderer.create(<Markdown source={input} escapeHtml={false} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('allows specifying a custom URI-transformer', () => {
  const input =
    'Received a great [pull request](https://github.com/rexxars/react-markdown/pull/15) today'

  const transform = uri => uri.replace(/^https?:\/\/github\.com\//i, '/')
  const component = renderer.create(<Markdown source={input} transformLinkUri={transform} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('can use parser plugins', () => {
  const input =
    'Just put\nhard breaks\nat each newline\n\n```\nbut not inside\ncode snippets\n```\n'

  const component = renderer.create(<Markdown source={input} plugins={[breaks]} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('supports checkbox lists', () => {
  const input = '- [ ] Foo\n- [x] Bar\n\n---\n\n- Foo\n- Bar'
  const component = renderer.create(<Markdown source={input} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to override text renderer', () => {
  const input = '# Header\n\nParagraph\n## New header\n1. List item\n2. List item 2\n\nFoo'
  const textRenderer = props => props.children.toUpperCase()
  const component = renderer.create(<Markdown source={input} renderers={{text: textRenderer}} />)
  expect(component.toJSON()).toMatchSnapshot()
})

test('should pass the key to an overriden text renderer', () => {
  const textRenderer = props => {
    expect(props.nodeKey).toEqual('text-1-1')
    return <marquee key={props.nodeKey}>{props.children}</marquee>
  }

  renderer.create(<Markdown source={'foo'} renderers={{text: textRenderer}} />)
})

test('should pass index of a node under its parent to non-tag renderers if includeNodeIndex option is enabled', () => {
  const input = 'Foo\n\nBar\n\nBaz'
  const paragraph = ({node, ...otherProps}) => {
    expect(otherProps).toMatchSnapshot()
    return <p>{otherProps.children}</p>
  }

  const component = renderer.create(
    <Markdown renderers={{paragraph}} source={input} includeNodeIndex />
  )
  expect(component.toJSON()).toMatchSnapshot()
})

test('should be able to override remark-parse plugin options', () => {
  // gfm is used by default in remark-parse which will not autolink URLs
  // containing a space unless the pedantic option is set to true.
  const input = '[Spaces in URLs](https://example.com/so much space "Title")'
  const pedantic = renderer.create(<Markdown source={input} parserOptions={{pedantic: true}} />)
  const unscholarly = renderer.create(<Markdown source={input} parserOptions={{pedantic: false}} />)

  expect(pedantic.toJSON()).toMatchSnapshot()
  expect(unscholarly.toJSON()).not.toBe(pedantic.toJSON())
})

test('should pass `node` as prop to all non-tag/non-fragment renderers', () => {
  const input = "# So, *headers... they're _cool_*\n\n"
  const heading = props => {
    let text = ''
    visit(props.node, 'text', child => {
      text += child.value
    })
    return text
  }

  const component = renderer.create(<Markdown renderers={{heading}} source={input} />)
  expect(component.toJSON()).toBe("So, headers... they're cool")
})
