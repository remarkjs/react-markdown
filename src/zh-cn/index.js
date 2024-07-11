/**
 * @typedef {import('@wooorm/starry-night').Grammar} Grammar
 * @typedef {import('unified').PluggableList} PluggableList
 */

import {createStarryNight} from '@wooorm/starry-night'
import sourceCss from '@wooorm/starry-night/source.css'
import sourceJs from '@wooorm/starry-night/source.js'
import sourceTs from '@wooorm/starry-night/source.ts'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import textHtmlBasic from '@wooorm/starry-night/text.html.basic'
import textMd from '@wooorm/starry-night/text.md'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import React from 'react'
// @ts-expect-error: untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import ReactDom from 'react-dom/client'
import Markdown from 'react-markdown'
// To do: replace with `starry-night` when async plugins are supported.
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'

/** @type {ReadonlyArray<Grammar>} */
const grammars = [
  sourceCss,
  sourceJs,
  sourceTs,
  sourceTsx,
  textHtmlBasic,
  textMd
]

const sample = `# \`react-markdown\` 的演示页面

\`react-markdown\` 是React的一个Markdown组件.

👉 修改这边的文本可以在右边实时渲染.

👈 在左侧写入一些markdown语句试试吧！

## 摘要

* 本项目遵循 [CommonMark](https://commonmark.org)
* （可选）本项目遵循 [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Markdown是被实时渲染成react元素的，并没有使用 \`dangerouslySetInnerHTML\`
* 允许您定义自己的组件，比如\`<MyHeading>\`而不是强制使用\`<'h1'>\`)
* 多种可选插件

## 内容

插件的演示范例
([\`remark-toc\`](https://github.com/remarkjs/remark-toc)).
**这里将会被替换成实际目录**.

## 语法高亮使用

下面是一个代码高亮的插件:
[\`rehype-highlight\`](https://github.com/rehypejs/rehype-highlight).

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'

const markdown = \`
# Your markdown here
\`

ReactDOM.render(
  <Markdown rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>,
  document.querySelector('#content')
)
\`\`\`

很简洁，不是吗？

## GitHub 风格的 Markdown (GFM)

你 *也可以* 使用
[\`remark-gfm\`](https://github.com/remarkjs/react-markdown#use)来使用GFM, .
这个插件支持GitHub特有的makrdown方法，包括但不限于：
表格, 删除线, 任务列表 和 文本链接.

**默认情况下，**这些插件不会自动启用.
👆 往上看，看到上方的\`勾选启用GFM\`了吗？勾选将其打开.

| 功能       | 支持程度              |
| ---------: | :------------------- |
| CommonMark | 100%                 |
| GFM        | 100% w/ \`remark-gfm\` |

~~删除线~~

* [ ] 任务列表
* [x] 任务列表（已勾选）

https://example.com

## 在markdown重嵌入html代码

⚠️ **警告！警告！警告！** 在markdown重嵌入html代码是一种**非常不安全的行为**,但如果你坚持想使用html, 你可以
使用 [\`rehype-raw\`](https://github.com/rehypejs/rehype-raw)这个插件.
你也可以将其与
[\`rehype-sanitize\`](https://github.com/rehypejs/rehype-sanitize)相结合.

<blockquote>
  👆 往上看，看到上方的\`勾选启用Html\`了吗？勾选将其打开.
</blockquote>

## 组件

您可以通过传递组件来更改内容:

\`\`\`js
import React from 'react'
import ReactDOM from 'react-dom'
import Markdown from 'react-markdown'
import MyFancyRule from './components/my-fancy-rule.js'

const markdown = \`
# 在这里写入你的markdown代码
\`

ReactDOM.render(
  <Markdown
    components={{
      // 用h2标签代替h1标签
      h1: 'h2',
      // 用一个组件代替hr
      hr(props) {
        const {node, ...rest} = props
        return <MyFancyRule {...rest} />
      }
    }}
  >
    {markdown}
  </Markdown>,
  document.querySelector('#content')
)
\`\`\`

## 了解更多

更多信息请访问GitHub项目的
[readme.md](https://github.com/remarkjs/react-markdown)!

***

[Espen Hovlandsdal](https://espen.codes/)的一个组件`

const main = document.querySelectorAll('main')[0]
const root = ReactDom.createRoot(main)

/** @type {Awaited<ReturnType<typeof createStarryNight>>} */
let starryNight

// eslint-disable-next-line unicorn/prefer-top-level-await -- XO is wrong.
createStarryNight(grammars).then(
  /**
   * @returns {undefined}
   */
  function (x) {
    starryNight = x

    const missing = starryNight.missingScopes()
    if (missing.length > 0) {
      throw new Error('Missing scopes: `' + missing + '`')
    }

    root.render(React.createElement(Playground))
  }
)

function Playground() {
  const [text, setText] = React.useState(sample)
  const [gfm, setGfm] = React.useState(false)
  const [raw, setRaw] = React.useState(false)
  /** @type {PluggableList} */
  const rehypePlugins = [rehypeSlug, rehypeHighlight]
  /** @type {PluggableList} */
  const remarkPlugins = [remarkToc]

  if (gfm) {
    remarkPlugins.unshift(remarkGfm)
  }

  if (raw) {
    rehypePlugins.unshift(rehypeRaw)
  }

  return (
    <>
      <form className="editor">
        <div className="controls">
          <label>
            <input
              type="checkbox"
              name="gfm"
              checked={gfm}
              onChange={function () {
                setGfm(!gfm)
              }}
            />{' '}
            勾选启用 <code>remark-gfm</code>
            <span className="show-big"> GFM</span>
          </label>
          <label>
            <input
              type="checkbox"
              name="raw"
              checked={raw}
              onChange={function () {
                setRaw(!raw)
              }}
            />{' '}
            勾选启用 <code>rehype-raw</code>
            <span className="show-big"> HTML</span>
          </label>
        </div>
        <div className="editor-inner">
          <div className="draw">
            {toJsxRuntime(starryNight.highlight(text, 'text.md'), {
              Fragment,
              jsx,
              jsxs
            })}
            {/* Trailing whitespace in a `textarea` is shown, but not in a `div`
          with `white-space: pre-wrap`.
          Add a `br` to make the last newline explicit. */}
            {/\n[ \t]*$/.test(text) ? <br /> : undefined}
          </div>
          <textarea
            spellCheck="false"
            className="write"
            value={text}
            rows={text.split('\n').length + 1}
            onChange={function (event) {
              setText(event.target.value)
            }}
          />
        </div>
      </form>
      <div className="result">
        <Markdown
          className="markdown-body"
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
        >
          {text}
        </Markdown>
      </div>
    </>
  )
}
