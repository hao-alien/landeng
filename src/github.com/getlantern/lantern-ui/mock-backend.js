/*global require */
(function () {
  'use strict';
  var ws = require('ws').Server;

  function start(port, logger) {
    var settings = {type: "settings",
      message: {version: "UI development",
        buildDate: "up-to-date",
        revisionDate: "up-to-date",
        autoReport: true,
        autoLaunch: true,
        proxyAll: false,
        instanceID: "ffffffff-ffff-ffff-ffff-ffffffffffff"
      }
    };
    ws({port: port, path: '/data'}).on('connection', function(ws) {
      ws.send(JSON.stringify(settings));
      logger.log('Lantern backend sent: %j', settings);
      ws.on('message', function(text) {
        logger.log('Lantern backend received: %s', text);
        var message = JSON.parse(text);
        if (message.Type == "settings") {
          for (var attr in message.Message ) {
            // TODO: there's a mismatch between attributes sent to and received
            // from lantern backend. Should capitalize all attributes in frontend.
            var toAttr = attr.replace(/^[a-z]/, function(match) {
              return match.toUpperCase();
            })
            settings.message[toAttr] = message.message[attr];
          }
        }
      });
    });
  }
  module.exports = start;
})();

