const webpack = require('webpack')
const path = require('path')

let config = {
  entry: [
    './index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
    }]
  }
}

if (process.env.NODE_ENV !== 'production') {
  config.entry.push('./samples/index.js')
}

module.exports = config
