var config = require("./config");

/**
 * Loads the routes for the API from the route collection in the mongo database
 */
function route_table_request() {
  var MongoClient = require('mongodb').MongoClient, format = require('util').format;
  MongoClient.connect(require('util').format('mongodb://%s:%s/%s', config.mongodb.host, config.mongodb.port, config.mongodb.database), function (err, db) {
    if (err) throw err;
    var collection = db.collection('routes');
    collection.count(function (err, count) {
      console.log("Loaded " + count + " routes from the collection.");
    });
    // Locate all the entries using find
    collection.find().toArray(function (err, results) {
      exports.routes = results;
      // Let's close the db
      db.close();
    });
  })
}
exports.route_table_request = route_table_request;