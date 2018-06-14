var Client = require('./client'),
  PduPort = require('./pduport'),
  Rack = require('./rack'),
  Server = require('./server.js'),
  Switch = require('./switch.js'),
  Connection = require('./connection.js'),
  async = require('async');

var DCIManager = function(opts) {
  this.client = new Client({
    auth: opts.auth,
    username: opts.username,
    password: opts.password,
    host: opts.host,
    port: opts.port,
    secure: opts.secure
  });
};

DCIManager.prototype.authenticate = function(callback) {
  this.client.authenticate(function(err, authkey) {
    callback(err, authkey);
  });
};

DCIManager.prototype.trafficpie = function(hostname, callback) {
  this.client.request('trafficpie', function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    var pies = json.doc.reportdata.trafficpie.elem.traff.elem;
    var pie;

    for (var i = 0; i < pies.length; i++) {
      if (pies[i].hostname.$ && pies[i].hostname.$ === hostname) {
        pie = pies[i];
        break;
      }
    }

    if (pie) {
      return callback(undefined, pie);
    } else {
      return callback('traffic pie not found');
    }
  });
};

DCIManager.prototype.trafficburstable_pie = function(hostname, callback) {
  this.client.request('trafficburstable_pie', function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    var traffics = json.doc.reportdata.traff.elem;
    var traff;

    for (var i = 0; i < traffics.length; i++) {
      if (traffics[i].hostname.$ && traffics[i].hostname.$ === hostname) {
        traff = traffics[i];
        break;
      }
    }

    if (traff) {
      return callback(undefined, traff);
    } else {
      return callback('traffic not found');
    }

  });
};

DCIManager.prototype.findPduPort = function(hostname, callback) {
  var dci = this;
  var _checkPdu = function(pduID, next, cb) {
    dci.getPduPorts(pduID, function(err, ports) {
      if (err) {
        return cb(err);
      }

      var port;

      for (var i = 0; i < ports.length; i++) {
        if (ports[i].serverhname.$ && ports[i].serverhname.$ === hostname) {
          port = ports[i];
          break;
        }
      }

      if (port) {
        return cb(undefined, new PduPort(port, dci.client));
      } else {
        return next();
      }
    });
  };

  dci.findServer(hostname, function(err, server) {
    if (err || !server) {
      return callback(err || 'missing server');
    }
    async.waterfall([function(fall) {
      var rack = server.getOptions().rack.$;
      var rackName = rack ? rack.split(' ')[0] : undefined;
      dci.rack(rackName, fall);
    }, function(rack, fall) {
      if (!rack) {
        return fall('missing rack');
      }

      var rackID = rack.getID();

      dci.pdu(rackID, fall);
    }, function(pdus, fall) {
      if (pdus.length === 0) {
        return fall('missing pdu');
      }

      async.mapSeries(pdus, function(pdu, next) {
        _checkPdu(pdu.id.$, next, fall);
      }, function(err) {
        if (err) {
          return fall(err);
        }
        return fall('port not found');
      });
    }], function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(undefined, result);
    });
  });
};

DCIManager.prototype.rack = function(name, callback) {
  var self = this;
  this.client.request('rack', function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    var racks = json.doc.elem;
    var found;

    for (var i = 0; i < racks.length; i++) {
      if (racks[i].name.$ == name) {
        found = racks[i];
        break;
      }
    }

    if (found) {
      return callback(undefined, new Rack(found, self.client));
    }

    return callback('rack not found');
  });
};

DCIManager.prototype.pdu = function(rack, callback) {
  this.client.request('pdu', function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    var pdus = json.doc.elem;
    var found = [];

    for (var i = 0; i < pdus.length; i++) {
      if (pdus[i].rack_id.$ == rack) {
        found.push(pdus[i]);
      }
    }

    if (found) {
      return callback(undefined, found);
    }

    return callback('pdu not found');
  });
};

DCIManager.prototype.getPduPorts = function(elid, callback) {
  var params = {
    elid: elid
  };

  this.client.request('pdu.port', params, function(err, data) {
    var json;

    if (data) {
      json = JSON.parse(data);
    }

    if (err || !data || json.doc.error) {
      return callback('error ocurred finding pdu port');
    }

    var port = json.doc.elem;
    return callback(undefined, port);
  });
};

DCIManager.prototype.getServers = function(callback) {
  var self = this;
  this.client.request('server', function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, json.doc.elem || []);
  });
};

DCIManager.prototype.findServer = function(hostname, callback) {
  var self = this;

  self.getServers(function(err, servers) {
    if (err) {
      return callback(err);
    }

    var found;

    for (var i = 0; i < servers.length; i++) {
      if (servers[i].hostname.$ == hostname) {
        found = servers[i];
        break;
      }
    }

    if (found) {
      return callback(undefined, new Server(found, self.client));
    }

    return callback('server not found');
  });
};

DCIManager.prototype.traffic = function(hostname, callback) {
  this.client.request('traffic', function(err, data) {
    if (err || !data) {
      return callback(err || 'no data');
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    var traffics = json.doc.reportdata.traff.elem;
    var traff;

    for (var i = 0; i < traffics.length; i++) {
      if (traffics[i].hostname.$ && traffics[i].hostname.$ === hostname) {
        traff = traffics[i];
        break;
      }
    }

    if (traff) {
      return callback(undefined, traff);
    } else {
      return callback('traffic not found');
    }
  });
};

DCIManager.prototype.getAvailableTemplates = function(callback){

  this.client.request('osmgr', function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.$type + ' - ' + json.doc.error.$object);
    }

    return callback(undefined, json.doc.elem);
  });
};

DCIManager.prototype.findSwitch = function(hostname, callback) {
  var dci = this;

  async.waterfall([function(fall) {
    dci.findServer(hostname, function(err, server) {
      if (err || !server) {
        return fall(err || 'missing server');
      }
      return fall(undefined, server);
    });
  }, function(server, fall) {
    var rack = server.getOptions().rack.$;
    var rackName = rack ? rack.split(' ')[0] : undefined;

    dci.client.request('switch', function(err, data) {
      if (err) {
        return fall(err);
      }

      var json = JSON.parse(data);

      if (json.doc.error) {
        return fall(json.doc.error.msg);
      }

      var switches = json.doc.elem;
      var found;

      for (var i = 0; i < switches.length; i++) {
        if (switches[i].rack.$ == rackName) {
          found = switches[i];
          break;
        }
      }

      if (found) {
        return fall(undefined, new Switch(found, dci.client));
      }

      return fall('switch not found');
    });
  }], function(err, sw) {
    if (err) {
      return callback(err);
    }
    return callback(undefined, sw);
  });
};

DCIManager.prototype.getServer = function(opts, callback) {
  return callback(undefined, new Server(opts, this.client));
};

DCIManager.prototype.getConnection = function(elid, plid, callback) {
  return callback(undefined, new Connection(elid, plid, this.client));
};
module.exports = DCIManager;
