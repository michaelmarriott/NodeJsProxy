var http = require("http");
var route_table = require("./route_table");
var authorization = require("./authorization");
var argv = require('optimist').argv;
var port = 8888;
if (argv.port) {
  port = argv.port
}

console.log("\n" +
"    _   __          __     ____                       \n" +
"   / | / /___  ____/ /__  / __ \_________  _  ____  __\n" +
"  /  |/ / __ \/ __  / _ \/ /_/ / ___/ __ \| |/_/ / / /\n" +
" / /|  / /_/ / /_/ /  __/ ____/ /  / /_/ />  </ /_/ / \n" +
"/_/ |_/\____/\__,_/\___/_/   /_/   \____/_/|_|\__, /  \n" +
"                                             /____/   \n" +
"");

/**
 * Starts the Server for the NodeProxy. Will load the route table and the system tokens
 * and listen for requests to the router and reroute them as required
 * @param proxy
 */
function start(proxy) {
  route_table.route_table_request();
  authorization.system_token_request();
  function onRequest(request, response) {
    var routes = route_table.routes;
    proxy(request, response, routes, authorization);
  }

  http.createServer(onRequest).listen(port);
  console.log("Loaded ApiRoutes v0.2. Listening for requests on port " + port);
}

exports.start = start;