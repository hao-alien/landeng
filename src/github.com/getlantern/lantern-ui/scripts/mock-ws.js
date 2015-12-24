/*global require */
(function () {
  'use strict';
  var ws = require('ws').Server;

  function start(port, logger) {
    var settings = {Type: "Settings",
      Message: {Version: "UI development",
        BuildDate: "up-to-date",
        RevisionDate: "up-to-date",
        AutoReport: true,
        AutoLaunch: true,
        ProxyAll: false,
        InstanceID: "ffffffff-ffff-ffff-ffff-ffffffffffff"
      }
    };
    ws({port: port, path: '/data'}).on('connection', function(ws) {
      ws.send(JSON.stringify(settings));
      logger.log('Lantern backend sent: %j', settings);
      ws.on('message', function(text) {
        logger.log('Lantern backend received: %s', text);
        var message = JSON.parse(text);
        if (message.Type == "Settings") {
          for (var attr in message.Message ) {
            // TODO: there's a mismatch between attributes sent to and received
            // from lantern backend. Should capitalize all attributes in frontend.
            var toAttr = attr.replace(/^[a-z]/, function(match) {
              return match.toUpperCase();
            })
            settings.Message[toAttr] = message.Message[attr];
          }
        }
      });
    });
  }
  module.exports = start;
})();

