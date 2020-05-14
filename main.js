var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var bcrypt = require("bcrypt-nodejs");
var db = require("./models"); // require
var apiRoutes = express.Router();
var cors = require('cors');
var email_validator = require("email-validator");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
 

//var fs = require("fs");   //file system


// =======================
// configuration =========
// =======================
var mongoose = require('mongoose');

// Connection URL
var url = config.database;

mongoose.Promise = global.Promise; //Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
mongoose.connect(url, {
    useNewUrlParser: true
}); // connect to database
app.set('superSecret', config.secret); // secret variable
app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));


// =======================
// routes ================
// =======================
app.use(cors());

// // basic route
app.get('/', function (req, res) {
    res.send('<b>Hello World</b>');
});


// route to authenticate a user (POST http://localhost:8080/api/login)
apiRoutes.post('/login', function (req, res) {
    var user_name = req.body.username;
    var password = req.body.password;
    try {
        if (req.body.username == null) {
            res.status(404).send({
                success: false,
                message: 'Login failed. Username not found.'
            });
        } else {
            // find the user
            db.User.findOne({
                username: req.body.username
            }, function (err, user) {

                if (err) throw err;
                //console.log(user._doc);
                if (user == null) {
                    res.status(404).send({
                        success: false,
                        message: 'Login failed. Username not found.'
                    });
                } else {
                    // check if password matches
                    bcrypt.compare(password, user._doc.password, function (err, bcryptResponce) {
                        if (bcryptResponce == true) {
                            // if user is found and password is right
                            // create a token
                            var token = jwt.sign({
                                user: user._doc.username
                            }, app.get('superSecret'), {
                                expiresIn: 1440 // expires in 24 hours
                            });

                            // return the information including token as JSON
                            res.json({
                                userDate: user._doc,
                                success: true,
                                message: 'Enjoy your token!',
                                token: token
                            });
                        } else {
                            res.status(404).send({
                                success: false,
                                message: 'Login failed. Wrong password.'
                            });
                        }
                    });

                }

            });
        }
    } catch (e) {
        res.status(500).send({
            success: false,
            message: "Internal server error."
        });
    }
});


apiRoutes.post('/setup', function (req, res) {
    var _setup = req.body.setup;
    if (_setup) {
        // create a sample user
        var nick = new db.User({
            username: _setup.username,
            password: _setup.password,
            admin: true,
            emailId: _setup.emailId
        });
        db.User.findOne({
            username: _setup.username
        }, function (err, user) {
            if (err) throw err;
            if (user != null) {
                // return the information including token as JSON
                res.status(300).send({
                    success: false,
                    message: 'Username is already taken!'
                });
            } else {
                bcrypt.hash(nick.password, null, null, function (err, hashpass) {
                    nick.password = hashpass;
                    // save the sample user
                    nick.save(function (err, result) {
                        if (err) throw err;
                        console.log('User saved successfully');
                        // return the information including token as JSON
                        res.json({
                            success: true,
                            user: result._doc
                        });
                    });
                });
            }

        });
    } else {
        // return the information including token as JSON
        res.status(401).send({
            success: false,
            message: 'You are not authorized'
        });
    }
});

//Create new user
apiRoutes.post('/signUp', function (req, res) {
    var user_name = req.body.username;
    var password = req.body.password;
    var email = req.body.emailId;
    var phone = req.body.phone;
    try {
        if (!user_name) {
            res.status(404).send({
                success: false,
                message: 'SignUp failed. Username is required.'
            });
            return;
        }
        if (!email) {
            res.status(404).send({
                success: false,
                message: 'SignUp failed. Email Id is required.'
            });
            return;
        } else if (!email_validator.validate(email)) {
            res.status(500).send({
                success: false,
                message: 'SignUp failed. Email Id is not valid.'
            });
            return;
        }
        if (!phone) {
            res.status(404).send({
                success: false,
                message: 'SignUp failed. Phone number is required.'
            });
            return;
        }
        if (!password) {
            res.status(404).send({
                success: false,
                message: 'SignUp failed. Password is required.'
            });
            return;
        } else {
            var nick = new db.User({
                username: user_name,
                password: password,
                admin: false,
                emailId: email,
                phoneNo: phone
            });

            db.User.findOne({
                username: req.body.username
            }, function (err, user) {
                if (err) throw err;
                if (user != null) {
                    // return the information including token as JSON
                    res.status(300).send({
                        success: false,
                        message: 'Username is already taken!'
                    });
                } else {
                    bcrypt.hash(nick.password, null, null, function (err, hashpass) {
                        nick.password = hashpass;
                        // save the sample user
                        nick.save(function (err, result) {
                            if (err) throw err;
                            // create a token
                            var token = jwt.sign({
                                user: nick.username
                            }, app.get('superSecret'), {
                                expiresIn: 1440 // expires in 24 hours
                            });

                            // return the information including token as JSON
                            res.json({
                                userDate: result._doc,
                                success: true,
                                message: 'User registered successfully',
                                token: token
                            });
                        });
                    });
                }

            });
        }
    } catch (e) {
        res.status(500).send({
            success: false,
            message: "Internal server error."
        });
    }
});


apiRoutes.get('/getBrand', function (req, res) {
    Brand.find(function (err, brands) {
        if (err) return console.error(err);
        res.send(brands);
    });

});

apiRoutes.get('/listUsers', function (req, res) {
    db.User.find(function (err, users) {
        if (err) return console.error(err);
        console.log(users);
        res.send(users);
    });
});


apiRoutes.get('/getUser/:username', function (req, res) {
    // find the user
    db.User.findOne({
            username: req.params.username
        }).populate("cars")
        .then(function (user) {
            //console.log(user._doc);
            if (user == null) {
                res.status(404).send({
                    success: false,
                    message: 'Username not found.'
                });
            } else {
                res.send(user);
            }
        }).catch(function (err) {
            res.json(err);
        });
    // First read existing users.
    // fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
    //     users = JSON.parse(data);
    //     var user = users["user" + req.params.id]
    //     console.log(user);
    //     res.end(JSON.stringify(user));
    // });
});


apiRoutes.get('/deleteUser/:username', function (req, res) {
    db.User.deleteOne({
        username: req.params.username
    }, function (err, user) {

        if (err) throw err;
        if (user.deletedCount === 1) {
            res.status(200).send({
                success: true,
                message: 'User deleted successfully.'
            });
        } else {
            res.status(404).send({
                success: false,
                message: 'User not found.'
            });
        }

    });
});

apiRoutes.post('/addCar/:username', function (req, res) {

    var newCar = db.Cars({
        model: req.body.model,
        year: req.body.year,
        company: req.body.company
    });
    newCar.save().then(function (car) {
        return db.User.findOneAndUpdate({
            username: req.params.username
        }, {
            $push: {
                cars: car._id
            }
        }, {
            new: true
        });
    }).then(function (User) {
        res.status(200).send({
            success: true,
            message: 'Car added successfully.'
        });
    }).catch(function (err) {
        res.json(err);
    });
});

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

    if (req.path === "/login") {
        next();
    } else if (req.path === "/signUp") {
        next();
    } else if (req.path === "/setup") {
        next();
    } else {
        var token = req.body.token || req.query.token || req.headers['token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
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
    }


});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


// =======================
// start the server ======
// =======================
var server = app.listen(app.get('port'), function () {
    console.log("Magic happens at http://127.0.0.1:" + app.get('port'))
});