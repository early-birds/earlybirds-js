const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: './samples/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: "/assets/",
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        plugins: ['lodash'],
        presets: ['es2015', 'stage-2']
      }
    }]
  },
}
