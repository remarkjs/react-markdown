const visit = require('unist-util-visit')

const splice = [].splice

exports.ofType = function (types, mode) {
  return ifNotMatch(allow, mode)
  function allow(node, index, parent) {
    return !types.includes(node.type)
  }
}

exports.ifNotMatch = ifNotMatch

function ifNotMatch(allow, mode) {
  return transform

  function transform(tree) {
    visit(tree, filter)
    return tree
  }

  // eslint-disable-next-line consistent-return
  function filter(node, index, parent) {
    if (parent && !allow(node, index, parent)) {
      let parameters = [index, 1]

      if (mode === 'unwrap' && node.children) {
        parameters = parameters.concat(node.children)
      }

      splice.apply(parent.children, parameters)
      return index
    }
  }
}
