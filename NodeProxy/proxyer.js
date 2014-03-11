var http = require("http");
var exec = require("child_process").exec;
var url = require("url");
var log = require("./api_logger");

/**
 * Handles the proxy operation for the incoming request. Will determine if the request needs to be secured and
 * if the request is valid (Has an incoming and outgoing route match)
 * @param request The Request that is made to the Server
 * @param response The response that will be returned from the server
 * @param routes The Routes loaded into the current api
 * @param authorization The Authorization handler for the api
 */
function proxy(request, response, routes, authorization) {
  var startTime = new Date();
  // Find the matching route for the given request path
  var requestUrl = url.parse(request.url);
  var route = findRoute(requestUrl.pathname, routes);
  if (route == null) {
    response.writeHeader(404, "Not Found");
    response.write("{'error':'Not Found'}");
    response.end();
    console.info("Not Found");
    log_response(request, response, requestUrl, route, null, startTime);
    return;
  }
  // Check if the route needs to be validated
  var authed = true;
  if (route.secure == true) {
    authed = authorization.auth(request.headers['system_token']);
  }
  var result = url.parse(route.to.replace(route.from, requestUrl.path));
  var options = {
    host: result.host,
    path: result.path,
    port: 80,
    method: request.method,
    headers: { 'system_token': request.headers['system_token'], 'start_time': new Date().toISOString() }
  };

  exec("proxy", function (error, stdout, stderr) {
    if (authed == null) {
      response.writeHeader(401, "Not Authetheniticated");
      response.write("{'error':'Not Authetheniticated'}");
      response.end();
      log_response(request, response, requestUrl, route, authed, startTime);
    } else {
      http.request(options,function (serverResponse) {
        if (request.headers["transfer-encoding"] == "chunked") {
          response.setHeader("Connection", "Keep-Alive");
        }
        response.writeHead(serverResponse.statusCode, serverResponse.headers);
        serverResponse.on('data', function (chunk) {
          response.write(chunk);
        });
        serverResponse.on('end', function () {
          response.end();
          log_response(request, response, requestUrl, route, authed, startTime);
        });
        serverResponse.on('error', function (e) {
          log_response(request, response, requestUrl, route, authed, startTime);
          console.log(e);
        });
      }).end();
    }
  });
}

/**
 * Find the route for the given path name
 * @param pathName Pathname to look up
 * @param routes Routes map
 * @returns {*} The found route for the pathname
 */
function findRoute(pathName, routes) {
  var val;
  for (var i in routes) {
    if (pathName.indexOf(routes[i].from.replace("*", "")) != -1) {
      if (val == null || val.from.length < routes[i].from.length) {
        val = routes[i]
      }
    }
  }
  return val;
}

/**
 * Log the response message
 * @param request The original request
 * @param response The response
 * @param requestUrl The Request Url
 * @param route The route
 * @param authed Authentication object
 * @param startTime Start Time that the request was processed
 */
function log_response(request, response, requestUrl, route, authed, startTime) {
  log.onLog({timestamp_response: new Date().toISOString(), response_code: response.statusCode,
    method: request.method, path: route.from, system_token: request.headers['system_token'],
    system_token_name: authed == null ? '' : authed.name, authorization: request.headers["Authorization"], process_time_ms: (new Date() - startTime),
    http_url: requestUrl.pathname, http_query: requestUrl.query, created_at: new Date().toISOString()});
}

exports.proxy = proxy;
