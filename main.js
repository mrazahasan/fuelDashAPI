var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./models/user'); // get our mongoose model
//var fs = require("fs");


// =======================
// configuration =========
// =======================
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var db;
// Connection URL
var url = config.database;


// Use connect method to connect to the server
MongoClient.connect(url, function (err, _db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = _db;
});
app.set('superSecret', config.secret); // secret variable
app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));


var insertDocuments = function (collectionName, user, db, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);
    // Insert some documents
    
    collection.insertMany([user], function (err, result) {
        assert.equal(err, null);
        //assert.equal(3, result.result.n);
        //assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the collection");
        callback(result);
    });
};
var findUser = function (collectionName, username, db, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);
    // Find some documents
    collection.find({ 'name': username }).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
};
var getAllUsers = function (collectionName, db, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        callback(docs);
    });
};
var updateDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a: 2 }
        , { $set: { b: 1 } }, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result);
        });
};
var removeDocument = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('documents');
    // Insert some documents
    collection.deleteOne({ a: 3 }, function (err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log("Removed the document with the field a equal to 3");
        callback(result);
    });
};

// =======================
// routes ================
// =======================
// basic route
app.get('/', function (req, res) {
    res.send('<b>Hello World</b>');
});

app.post('/login', function (req, res) {
    var user_name = req.body.user;
    var password = req.body.password;
    if (user_name != "" && password != "") {
        findUser('users', user_name, db, function (result) {
            res.send(result);
            db.close();
        });
    }
    console.log("User name = " + user_name + ", password is " + password);
});

app.get('/listUsers', function (req, res) {
    getAllUsers('users', db, function (result) {
        res.send(result);
        db.close();
    });
});

app.get('/addUser', function (req, res) {
    var user = {
        "name": "user_name",
        "password": "password"
    };
    insertDocuments('users', user, db, function (result) {
        res.send(result);
        db.close();
    });
});

app.get('/listUsers/:id', function (req, res) {
    // First read existing users.
    // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //     users = JSON.parse(data);
    //     var user = users["user" + req.params.id]
    //     console.log(user);
    //     res.end(JSON.stringify(user));
    // });
});

app.get('/deleteUser/:id', function (req, res) {

    // First read existing users.
    // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //     data = JSON.parse(data);
    //     delete data["user" + req.params.id];

    //     console.log(data);
    //     res.end(JSON.stringify(data));
    // });
});
app.get('/setup', function (req, res) {

    // create a sample user
    var nick = {
        name: 'admin',
        password: 'password',
        admin: true
    };

    // save the sample user
    insertDocuments('users', nick, db, function (result) {
        res.send(result);
        db.close();
    });
});


// =======================
// start the server ======
// =======================
var server = app.listen(app.get('port'), function () {
    //var host = server.address().address
    //var port = server.address().port
    console.log("Magic happens at http://127.0.0.1:" + app.get('port'))
});
