var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var bcrypt = require("bcrypt-nodejs");
var User = require('./models/users'); // get our mongoose model
var apiRoutes = express.Router();
//var fs = require("fs");   //file system


// =======================
// configuration =========
// =======================
var mongoose = require('mongoose');
var assert = require('assert');
var db;
// Connection URL
var url = config.database;


mongoose.connect(config.database); // connect to database
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
        console.log("Inserted documents into the: " + collectionName);
        callback(result);
    });
};
var findUser = function (collectionName, username, db, callback) {
    // Get the documents collection
    var collection = db.collection(collectionName);
    // Find some documents
    collection.find({ 'username': username }).toArray(function (err, docs) {
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


// route to authenticate a user (POST http://localhost:8080/api/login)
apiRoutes.post('/login', function (req, res) {
    var user_name = req.body.username;
    var password = req.body.password;

    // find the user
    User.findOne({ username: req.body.username }, function (err, user) {
        if (err) throw err;
        console.log(user._doc);
        if (user == null) {
            res.json({ success: false, message: 'Authentication failed. Username not found.' });
        }
        else {
            // check if password matches
            bcrypt.compare(password, user._doc.password, function (err, bcryptResponce) {
                if (bcryptResponce == true) {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign({ user: user._doc.username }, app.get('superSecret'), {
                        expiresIn: 1440 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                        success: true,
                        message: 'Enjoy your token!',
                        token: token
                    });
                }
                else {
                    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                }
            });

        }

    });
});


apiRoutes.post('/setup', function (req, res) {
    var _setup = req.body.setup;
    if (_setup) {
        // create a sample user
        var nick = new User({
            username: 'admin',
            password: 'abc',
            admin: true
        });
        User.findOne({ username: "admin" }, function (err, user) {
            if (err) throw err;
            if (user != null) {
                // return the information including token as JSON
                res.status(300).send({
                    success: false,
                    message: 'Username is already taken!'
                });
            }
            else {
                bcrypt.hash(nick.password, null, null, function (err, hashpass) {
                    nick.password = hashpass;
                    // save the sample user
                    nick.save(function (err, result) {
                        if (err) throw err;
                        console.log('User saved successfully');
                        // return the information including token as JSON
                        res.json({ success: true, user: result._doc });
                    });
                });
            }

        });
    }
    else {
        // return the information including token as JSON
        res.status(401).send({
            success: false,
            message: 'You are not authorized'
        });
    }
});

//Create new user
apiRoutes.post('/addUser', function (req, res) {
    var nick = new User({
        username: "user_name",
        password: "password",
        admin: false
    });
    bcrypt.hash(nick.password, null, null, function (err, hashpass) {
        nick.password = hashpass;
        // save the sample user
        nick.save(function (err, result) {
            if (err) throw err;
            console.log('User saved successfully');
            // return the information including token as JSON
            res.json({ success: true, user: result._doc });
        });
    });
});


// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


apiRoutes.get('/listUsers', function (req, res) {
    User.find(function (err, users) {
        if (err) return console.error(err);
        console.log(users);
        res.send(users);
    });
});


apiRoutes.get('/listUsers/:username', function (req, res) {
    // First read existing users.
    // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //     users = JSON.parse(data);
    //     var user = users["user" + req.params.id]
    //     console.log(user);
    //     res.end(JSON.stringify(user));
    // });
});


apiRoutes.get('/deleteUser/:username', function (req, res) {

    // First read existing users.
    // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //     data = JSON.parse(data);
    //     delete data["user" + req.params.id];

    //     console.log(data);
    //     res.end(JSON.stringify(data));
    // });
});


// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


// =======================
// start the server ======
// =======================
var server = app.listen(app.get('port'), function () {
    //var host = server.address().address
    //var port = server.address().port
    console.log("Magic happens at http://127.0.0.1:" + app.get('port'))
});
