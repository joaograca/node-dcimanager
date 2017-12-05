var PduPort = function(opts, client) {
  this.opts = opts;
  this.client = client;
};

PduPort.prototype.getID = function() {
  return this.opts.id.$;
};

PduPort.prototype.getOptions = function(callback) {
  return this.opts;
};

PduPort.prototype.powerOff = function(callback) {
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('pdu.off', params, function(err, data) {
    if (err || !data) {
      return callback(err || 'missing data');
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'the pdu was powered off successfully');
  });
};

PduPort.prototype.powerOn = function(elid, callback) {
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('pdu.on', params, function(err, data) {
    if (err || !data) {
      return callback(err || 'missing data');
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'the pdu was powered on successfully');
  });
};

PduPort.prototype.getPowerStatus = function(callback) {
  if (!this.opts.power || this.opts.power.$ === '0') {
    return callback(undefined, 'off');
  } else if (this.opts.power.$ === '1') {
    return callback(undefined, 'on');
  } else {
    return callback('unknown status');
  }
};

module.exports = PduPort;
