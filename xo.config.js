import react from 'eslint-plugin-react'
import globals from 'globals'

/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
  // Cast because xo does not deal with `exactOptionalPropertyTypes` properly.
  /** @type {import('xo').XoConfigItem} */ (
    /** @type {unknown} */ (react.configs.flat['jsx-runtime'])
  ),
  {
    languageOptions: {globals: {...globals.browser, ...globals.node}},
    name: 'default',
    prettier: 'compat',
    rules: {
      complexity: 'off',
      // Wrong about self.
      'import-x/order': 'off',
      // Ugly.
      'jsdoc/check-indentation': 'off',
      // Wrong.
      'jsdoc/check-line-alignment': 'off',
      // Wrong about JSX pragmas.
      'jsdoc/no-bad-blocks': 'off',
      // Incorrect.
      'jsdoc/reject-function-type': 'off',
      // Terrible.
      'jsdoc/require-asterisk-prefix': 'off',
      // Ugly.
      'no-shadow': 'off',
      // Gross.
      'prefer-destructuring': 'off',
      // Verbose.
      'regexp/prefer-named-capture-group': 'off',
      // Not supported.
      'require-unicode-regexp': 'off',
      // Bad.
      'unicorn/consistent-boolean-name': 'off',
      // Not supported yet.
      'unicorn/no-array-sort': 'off',
      // Horrible.
      'unicorn/prefer-continue': 'off',
      // Ugly.
      'unicorn/prefer-early-return': 'off',
      // Wrong about test cases.
      'unicorn/prefer-https': 'off',
      // Not good.
      'unicorn/prefer-promise-with-resolvers': 'off',
      // Bad.
      'unicorn/require-array-sort-compare': 'off'
    },
    space: true
  },
  {rules: {'prefer-arrow-callback': 'off'}}
]

export default xoConfig
