import {babel} from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import {terser} from 'rollup-plugin-terser'

const config = {
  input: '.',
  output: {
    file: './react-markdown.min.js',
    format: 'umd',
    name: 'ReactMarkdown',
    exports: 'default',
    plugins: [
      terser({
        // No need to mangle here, will do that at the end.
        mangle: false,
        output: {
          // eslint-disable-next-line camelcase
          ascii_only: true
        }
      }),
      terser({
        output: {
          // eslint-disable-next-line camelcase
          ascii_only: true
        },
        mangle: {
          safari10: true
        }
      })
    ]
  },
  plugins: [
    nodeResolve({browser: true}),
    json(),
    commonjs(),
    nodePolyfills(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/env']
    })
  ]
}

export default config
