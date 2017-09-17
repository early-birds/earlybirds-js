const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: "/assets/",
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
    library: 'Eb',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        plugins: [
          ['lodash'],
        ],
        presets: ['es2015', 'stage-2'],
      }
    }]
  },
}
