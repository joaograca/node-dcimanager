var SwitchPort = require('./switchport.js'),
  async = require('async');

var Switch = function(opts, client) {
  this.opts = opts;
  this.client = client;
};

Switch.prototype.getID = function(callback) {
  return callback(undefined, this.opts.id.$);
};

Switch.prototype.getOptions = function(callback) {
  return callback(undefined, this.opts);
};

Switch.prototype.getPorts = function(callback) {
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('switch.port', params, function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, json.doc.elem);
  });
};

Switch.prototype.getPortByHost = function(hostname, callback) {
  var self = this;


  async.waterfall([function(fall) {
    self.getPorts(fall);
  }, function(ports, fall) {
    for (var i = 0; i < ports.length; i++) {
      if (ports[i].serverhname.$ == hostname) {
        port = ports[i];
        break;
      }
    }

    if (!port) {
      return fall('port not found');
    }

    return fall(undefined, port);
  }], function(err, result) {
    if (err) {
      return callback(err);
    }
    return callback(undefined, new SwitchPort(port, self.client));
  });
};

module.exports = Switch;
