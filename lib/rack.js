var Rack = function(opts, client) {
  this.opts = opts;
  this.client = client;
};

Rack.prototype.getID = function() {
  return this.opts.id.$;
};

Rack.prototype.getOptions = function(callback) {
  return this.opts;
};

module.exports = Rack;
