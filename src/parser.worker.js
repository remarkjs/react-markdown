const unified = require('unified')
const markdown = require('remark-parse')

addEventListener('message', ({ data: src }) => {
  const rawAst = unified().use(markdown).parse(src)
  postMessage(rawAst)
})
