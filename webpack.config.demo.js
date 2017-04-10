'use strict';

var path = require('path');
var webpack = require('webpack');
var prod = process.env.NODE_ENV === 'production';

var config = {
    devtool: prod ? null : 'eval',

    entry: [
        path.join(__dirname, 'demo', 'src', 'demo.js')
    ],

    output: {
        path: path.join(__dirname, 'demo', 'dist', 'js'),
        filename: 'demo.js',
        publicPath: '/demo/dist',
        libraryTarget: 'umd'
    },

    externals: {
        'react': {
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
        loaders: [{
            test: /\.js$/,
            loader: 'buble'
        }, {
            test: /\.json$/,
            loader: 'json'
        }]
    },

    plugins: [
        new webpack.NoErrorsPlugin()
    ]
};

if (prod) {
    config.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }));
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;
