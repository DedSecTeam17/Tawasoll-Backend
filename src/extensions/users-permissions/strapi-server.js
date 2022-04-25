'use strict';

module.exports = require('./server');
module.exports = require('./routes');

module.exports = (plugin) => {
  // plugin.bootstrap = require('./server/bootstrap');
  // plugin.services['providers'] = require("./server/services/providers");

  // plugin.services['controllers'] =
  // plugin.services['routes'] =

  plugin.controllers = require("./server/controllers");
  plugin.routes = require("./routes");

//controllers
  return plugin;
};

