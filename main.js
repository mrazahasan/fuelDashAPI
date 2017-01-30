var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var db;
// Connection URL
var url = 'mongodb://admin:admin123@ds135669.mlab.com:35669/fueldash';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, _db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = _db;
});
var user = {
   "user4" : {
      "name" : "mohit",
      "password" : "password4",
      "profession" : "teacher",
      "id": 4
   }
};
var insertDocuments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('users');
    // Insert some documents
    collection.insertMany([{
        "name" : "mahesh",
        "password" : "password1",
        "profession" : "teacher",
        "id": 1
    },
    {
        "name" : "suresh",
        "password" : "password2",
        "profession" : "librarian",
        "id": 2
    },
    {
        "name" : "ramesh",
        "password" : "password3",
        "profession" : "clerk",
        "id": 3
    }], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the collection");
        callback(result);
    });
};
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello World');
    insertDocuments(db, function() {
        db.close();
    });
    
});

app.post('/login',function(req,res){
  var user_name=req.body.user;
  var password=req.body.password;
  console.log("User name = "+user_name+", password is "+password);
  res.writeHead(200, {"Content-Type": "application/json"});

  var otherArray = ["item1", "item2"];
  var otherObject = { item1: "item1val", item2: "item2val" };
  var json = JSON.stringify({ 
    anObject: otherObject, 
    anArray: otherArray, 
    another: "item"
  });
  res.end(json);
});

app.get('/listUsers', function (req, res) {
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });
});

app.get('/addUser', function (req, res) {
   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       data["user4"] = user["user4"];
       console.log( data );
       res.end( JSON.stringify(data));
   });
});

app.get('/listUsers/:id', function (req, res) {
   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       users = JSON.parse( data );
       var user = users["user" + req.params.id] 
       console.log( user );
       res.end( JSON.stringify(user));
   });
});

app.get('/deleteUser/:id', function (req, res) {

   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       delete data["user" + req.params.id];
       
       console.log( data );
       res.end( JSON.stringify(data));
   });
})


var server = app.listen(app.get('port'), function () {
    //var host = server.address().address
    //var port = server.address().port
    console.log("Example app listening at http://127.0.0.1:"+ app.get('port'))
});
