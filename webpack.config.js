var path = require('path');
var webpack = require('webpack');
var baseDir = process.cwd();

var webpackConfig = {
  debug: true,
  target: 'web',
  entry: {
    main: baseDir + '/src/js/main.js',
    //main2: baseDir + '/src/js/main2.js',
  },
  output: {
    path: baseDir + '/dist/assets', //path.join(__dirname, 'dist', 'assets'),
    publicPath: '/assets',
    filename: '[name].js', // '[name]-[hash].js' for production
    chunkFilename: '[chunkhash].js'
  },
  resolve: {
  },
  // look for required files in these directories
  modulesDirectories: [
    //baseDir + '/bower_components',
    //baseDir + '/node_modules'
  ],
  module: {
    loaders: [
      { test: /\.css/, loader: ['style', 'css'] },
      { test: /\.js(x)?$/, loader: 'jsx-loader?harmony' },
      { test: /\.gif/, loader: "url-loader?limit=10000&minetype=image/gif" },
      { test: /\.jpg/, loader: "url-loader?limit=10000&minetype=image/jpg" },
      { test: /\.png/, loader: "url-loader?limit=10000&minetype=image/png" },
    ],
    noParse: /\.min\.js/
  },
  plugins: [

  ]
};

module.exports = webpackConfig;
