var HeartBeater = require('./heartbeater'),
  qs = require('qs'),
  util = require('util');

var Client = function(config)  {
  config.protocol = (config.secure) ? 'https' : 'http';
  this.config = config;
  this.authenticate(function(err, authkey) {
    if (err) {
      console.log('ERROR AUTHENTICATING');
      console.log(err);
    }
  });
  new HeartBeater(this).run();
};

Client.prototype.request = function(func, params, callback) {
  var self = this;

  if (!callback && typeof params === 'function') {
    callback = params;
    params = {};
  }

  params = params || {};
  params.out = 'json';
  params.func = func;
  params.auth = this.authkey;

  self.send(params, callback);
};

Client.prototype.authenticate = function(callback) {
  var self = this;

  var params = {
    username: this.config.username,
    password: this.config.password,
    func: 'auth',
    out: 'json'
  };

  this.send(params, function(err, data) {
    if (err || !data) {
      return callback(err || 'missing data');
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.$type + ' - ' + json.doc.error.$object);
    }
    self.authkey = json.doc.auth.$;
    return callback();
  });
};

Client.prototype.send = function(params, callback) {
  var path = '/manager/dcimgr';
  var data = qs.stringify(params);
  //console.log(data);

  var opts = {
    host: this.config.host,
    port: this.config.port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  var req = require(this.config.protocol).request(opts, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      if (res.statusCode >= 400 && res.statusCode < 600 ||
        res.statusCode < 10) {
        callback(res.statusCode + ' - ' + res.statusMessage);
      } else {
        res.data = data;
        callback(null, data);
      }
    });
  });

  req.on('error', function(e) {
    callback(e.message);
  });

  req.write(data);

  req.end();
};

module.exports = Client;
