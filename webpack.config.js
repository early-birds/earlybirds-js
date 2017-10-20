const webpack = require('webpack')
const path = require('path')
//var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  entry: [
    './index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/assets/",
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
    library: 'Eb',
  },
//  plugins: [new BundleAnalyzerPlugin()],
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
