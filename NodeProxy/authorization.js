var http = require("http");
var config = require("./config");
var tokens;

/**
 * Loads the System tokens from the database and stores the results in a system_token_request map
 */
function system_token_request() {
  var MongoClient = require('mongodb').MongoClient, format = require('util').format;
  MongoClient.connect(require('util').format('mongodb://%s:%s/%s', config.mongodb.host, config.mongodb.port, config.mongodb.database), function (err, db) {
    if (err) throw err;
    var collection = db.collection('tokens');
    collection.count(function (err, count) {
      console.log("Loaded " + count + " system tokens from the collection.");
    });
    collection.find().toArray(function (err, results) {
      tokens = results;
      exports.tokens = results;
      db.close();
    });
  })
}

/**
 * Authenticates the given token by checking if the token is known
 * @param request_token Token to check in the map
 * @returns {*} The Token if found, otherwise a null value
 */
function auth(request_token) {
  for (var i in tokens) {
    if (tokens[i].key == request_token) {
      return tokens[i];
    }
  }
  return null;
}

exports.system_token_request = system_token_request;
exports.auth = auth;