/* eslint-disable no-process-env */
'use strict'

const path = require('path')
const webpack = require('webpack')
const prod = process.env.NODE_ENV === 'production'

const config = {
  mode: prod ? 'production' : 'development',
  devtool: prod ? false : 'eval',

  entry: [path.join(__dirname, 'demo', 'src', 'demo.js')],

  output: {
    path: path.join(__dirname, 'demo', 'dist', 'js'),
    filename: 'demo.js',
    publicPath: '/demo/dist',
    libraryTarget: 'umd'
  },

  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom'
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },

  plugins: []
}

if (prod) {
  config.plugins.push(
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})
  )
}

module.exports = config
