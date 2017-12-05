# node-dcimanager

## Usage Example

```javascript
var DCIManager = require('../lib/dcimanager.js');

var dci = new DCIManager({
  username: 'user',
  password: 'xxxxxxxxxxxxxx',
  host: 'hostname',
  port: '1500'
});

var hostname = 'loremipsum.foo';

setTimeout(function() {
  dci.findServer(hostname, function(err, server) {
    if (err) {
      return console.log(err);
    }
    console.log(server.getOptions());
  });
}, 1000);
```
