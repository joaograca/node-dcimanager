var Connection = function(elid, plid, client) {
  this.opts = {
    id: elid,
    plid: plid
  };
  this.client = client;
};

Connection.prototype.getID = function() {
  return this.opts.id;
};

Connection.prototype.getOptions = function() {
  return this.opts;
};

Connection.prototype.edit = function(callback) {
  var self = this;

  var params = {
    elid: this.opts.id,
    plid: this.opts.plid
  };

  this.client.request('server.connection.edit', params, function(err, data) {
    if (err) {
      return callback(err);
    }

    var json = JSON.parse(data);

    if (json.doc.error) {
      return callback(json.doc.error.msg.$);
    }

    return callback(undefined, json.doc);
  });
};

module.exports = Connection;
