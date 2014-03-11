// Node.js entry point
var server = require("./server");
var proxyer = require("./proxyer");
server.start(proxyer.proxy);