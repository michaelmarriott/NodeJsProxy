var MongoClient = require('mongodb').MongoClient, format = require('util').format;


MongoClient.connect('mongodb://127.0.0.1:27017/nodeproxy', function (err, db) {
    if (err) throw err;
    var collection = db.collection('routes');
    collection.insert([{ "id": "518a21dabb4340a36700000e", "name": "Test Route", "description": "Route For Testing", "from": "/2/google", "to": "http://www.google.com", "secure": true, "hits": 0, "last_hit": null }], { w: 0 });

    var collection = db.collection('tokens');
    collection.insert([{ "id": "51496b0abb434049d400001a", "name": "admin", "key": "9160b62d-98a2-4d0b-bb33-fe804e6e2986" }], { w: 0 });
    console.log("Done seeding");
})