'use strict'

const path = require('path')
const webpack = require('webpack')
const assign = require('object-assign')
const baseConfig = require('./webpack.config')

const config = assign({}, baseConfig, {
  entry: [path.join(__dirname, 'src', 'react-markdown.js')],
  output: {
    path: path.join(__dirname, 'umd'),
    filename: 'react-markdown.js',
    libraryTarget: 'umd'
  },
  plugins: baseConfig.plugins.concat([new webpack.IgnorePlugin(/path-browserify/)])
})

module.exports = config
