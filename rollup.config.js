import jsx from 'acorn-jsx'
import {babel} from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'
import {terser} from 'rollup-plugin-terser'
import nodePolyfills from 'rollup-plugin-node-polyfills'

const config = {
  acornInjectPlugins: [jsx()],
  input: 'src/index.js',
  output: {
    file: 'dest/index.js',
    name: 'demo',
    format: 'iife',
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
      presets: ['@babel/preset-react', '@babel/env']
    }),
    replace({'process.env.NODE_ENV': '"production"'})
  ]
}

export default config
