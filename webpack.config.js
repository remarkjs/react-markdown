/* eslint-disable no-process-env */
'use strict'

const path = require('path')
const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const prod = process.env.NODE_ENV === 'production'

module.exports = {
  mode: prod ? 'production' : 'development',
  entry: [path.join(__dirname, 'src', 'react-markdown.js')],
  output: {
    library: 'reactMarkdown',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'umd'),
    filename: 'react-markdown.js'
  },
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    process.env.ANALYZE_BUNDLE && new BundleAnalyzerPlugin()
  ].filter(Boolean)
}
