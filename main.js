// var express = require('express');
// var bodyParser = require("body-parser");
// var app = express();
// var fs = require("fs");
// var user = {
//    "user4" : {
//       "name" : "mohit",
//       "password" : "password4",
//       "profession" : "teacher",
//       "id": 4
//    }
// };

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.get('/', function (req, res) {
//    res.send('Hello World');
// });

// app.post('/login',function(req,res){
//   var user_name=req.body.user;
//   var password=req.body.password;
//   console.log("User name = "+user_name+", password is "+password);
//   res.writeHead(200, {"Content-Type": "application/json"});

//   var otherArray = ["item1", "item2"];
//   var otherObject = { item1: "item1val", item2: "item2val" };
//   var json = JSON.stringify({ 
//     anObject: otherObject, 
//     anArray: otherArray, 
//     another: "item"
//   });
//   res.end(json);
// });

// app.get('/listUsers', function (req, res) {
//    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//        console.log( data );
//        res.end( data );
//    });
// });

// app.get('/addUser', function (req, res) {
//    // First read existing users.
//    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//        data = JSON.parse( data );
//        data["user4"] = user["user4"];
//        console.log( data );
//        res.end( JSON.stringify(data));
//    });
// });

// app.get('/listUsers/:id', function (req, res) {
//    // First read existing users.
//    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//        users = JSON.parse( data );
//        var user = users["user" + req.params.id] 
//        console.log( user );
//        res.end( JSON.stringify(user));
//    });
// });

// app.get('/deleteUser/:id', function (req, res) {

//    // First read existing users.
//    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//        data = JSON.parse( data );
//        delete data["user" + req.params.id];
       
//        console.log( data );
//        res.end( JSON.stringify(data));
//    });
// })


// var server = app.listen(8081, function () {
//     var host = server.address().address
//     var port = server.address().port
//     console.log("Example app listening at http://127.0.0.1:"+ port)
// });
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");
var user = {
   "user4" : {
      "name" : "mohit",
      "password" : "password4",
      "profession" : "teacher",
      "id": 4
   }
};

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.send('Hello World');
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
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


