var SwitchPort = function(opts, client) {
  this.opts = opts;
  this.client = client;
};

SwitchPort.prototype.getID = function(callback) {
  return callback(undefined, this.opts.id.$);
};

SwitchPort.prototype.getOptions = function(callback) {
  return callback(undefined, this.opts);
};

SwitchPort.prototype.getInfo = function(callback) {
  var params = {
    elid: this.opts.identity.$
  };

  var func = 'switch.port.refresh';

  this.client.request(func, params, function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, json.doc);
  });
};

SwitchPort.prototype.powerOff = function(callback) {
  var params = {
    elid: this.opts.id.$
  };

  var func = 'switch.port.off';

  this.client.request(func, params, function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'switch port powered off successfully');
  });
};

SwitchPort.prototype.powerOn = function(callback) {
  var params = {
    elid: this.opts.id.$
  };

  var func = 'switch.port.on';

  this.client.request(func, params, function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'switch port powered on successfully');
  });
};

module.exports = SwitchPort;
