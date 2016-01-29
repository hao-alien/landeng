// Gets called when running npm start

var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.dev.config')
var lanternBackendPort = 3031;
var lanternBackend = 'http://localhost:' + lanternBackendPort;
var backend = require('./mock-backend');

console.log('Starting server...\n')

backend(lanternBackendPort, console);
new WebpackDevServer(webpack(config), { // Start a server
  publicPath: config.output.publicPath,
  hot: true, // With hot reloading
  inline: false,
  historyApiFallback: true,
  quiet: true // Without logging
  proxy: {
    '/data': {
      target: lanternBackend,
      ws: true
    }
  }
}).listen(2000, 'localhost', function (err, result) {
  if (err) {
    console.log(err)
  } else {
    console.log('Server started')
    console.log('Listening at localhost:2000')
  }
});
