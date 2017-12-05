var Ipmi = require('./ipmi');

var Server = function(opts, client) {
  this.opts = opts;
  this.client = client;
};

Server.prototype.getID = function(){
  return this.opts.id.$;
};

Server.prototype.getOptions = function(){
  return this.opts;
};

Server.prototype.powerOff = function(callback){
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('server.poweroff', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'the server was powered off successfully');
  });
};

Server.prototype.powerOn = function(callback){
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('server.poweron', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'the server was powered on successfully');
  });
};

Server.prototype.reboot = function(callback){
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('server.reboot', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg);
    }

    return callback(undefined, 'the server was rebooted successfully');
  });
};

Server.prototype.getPowerStatus = function(callback) {
  if (!this.opts.poweron) {
    return callback(undefined, 'off');
  } else {
    return callback(undefined, 'on');
  }
};

Server.prototype.getOSTemplates = function(callback){
  var params = {
    elid: this.opts.id.$
  };

  this.client.request('server.operations', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.$type + ' - ' + json.doc.error.$object);
    }

    var ops = json.doc.slist;
    var templates;
    var currTemplate = json.doc.ostemplate.$;

    for(var i = 0; i < ops.length; i++){
      if(ops[i].$name && ops[i].$name === 'ostemplate'){
        templates = ops[i].val;
        break;
      }
    }

    return callback(undefined, templates);
  });
};

Server.prototype.provision = function(template, pass, callback){
  var params = {
    elid: this.opts.id.$,
    ipaddr: this.opts.ip.$,
    hostname: this.opts.hostname.$,
    ostemplate: template,
    passwd: pass,
    confirm: pass,
    sok: 'ok',
    operation: 'ostemplate',
    isotemplate: 'no_iso_template',
    clearhdd: 'off',
    fullhddclear: 'off',
    clicked_button: 'ok',
    diag: 'ISPsystem__Diag-x86_64',
    rescue: 'ISPsystem__Sysrescd-x86_64'
  };

  this.client.request('server.operations', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.error){
      return callback(json.error.msg.$);
    }

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }

    return callback(undefined, 'provisioning');
  });
};

Server.prototype.getProvisionStatus = function(callback){
  var params = {
    elid: this.opts.id.$,
    clickstat: 'title',
    hint_field: 'install_in_progress'
  };

  this.client.request('server', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.error){
      return callback(json.error.msg.$);
    }

    return callback(undefined, json.doc.value.$);
  });
};

Server.prototype.cancelProvision = function(callback){
  var params = {
    elid: this.opts.id.$,
  };

  this.client.request('server.opercancel', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }

    return callback(undefined, 'provision cancelled');
  });
};

Server.prototype.getCurrentDetails = function(period, callback){
  var params = {
    elid: this.opts.id.$,
    period: period
  };

  this.client.request('currentdetails', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }

    return callback(undefined, json.doc.reportdata);
  });
};

Server.prototype.getIPMIRedirect= function(callback){
  var self = this;
  var params = {
    elid: this.opts.id.$,
    value: this.opts.ipmi.$,
    newwindow: 'yes'
  };

  this.client.request('ipmiredirect', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }

    //TODO temp
    // return self.client.getConsole(json.doc.ok.$, callback);

    return callback(undefined, new Ipmi(json.doc.ok.$, self.client.authkey));
  });
};

Server.prototype.createIPMI = function(callback){
  var self = this;
  var params = {
    plid: this.opts.id.$,
    sok: 'ok'
  };

  this.client.request('server.connection.autocreateipmi', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }
    return callback(undefined, json.doc);
  });
};

Server.prototype.serverConnection = function(callback){
  var self = this;

  var params = {
    elid: this.opts.id.$
  };

  this.client.request('server.connection', params, function(err, data){
    if(err){
      return callback(err);
    }

    var json = JSON.parse(data);

    if(json.doc.error){
      return callback(json.doc.error.msg.$);
    }

    return callback(undefined, json.doc);
  });
};



module.exports = Server;
