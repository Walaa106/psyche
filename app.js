

var express = require('express'),
  config = require('./config/config');

var app = express();

require('./config/express')(app, config);
require('./routes')(app);

// var property_controller  = require('./api/property/property.controller.js');
// console.log(process.argv[2], 'argv i miss');

// var arg = process.argv
//- arg[3]: pages, arg[2]: size
// property_controller.index(arg[2], arg[3])

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});
