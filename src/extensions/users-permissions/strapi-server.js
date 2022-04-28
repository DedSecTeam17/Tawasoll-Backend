'use strict';
module.exports = (plugin) => {
  plugin.controllers = require("./server/controllers");
  plugin.routes = require("./routes");
  return plugin;
};

