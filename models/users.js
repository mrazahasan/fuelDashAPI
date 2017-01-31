// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({ 
    username: String, 
    password: String,
    name: String,
    admin: Boolean,
    phoneNo: String,
    emailId: String,
    cars:[
        {
            model: String,
            year: String,
            company: String
        }
    ],
    fuelHistory:[
        {
            rupees: Number,
            liters: Number,
            mileage: Number,
            numberOfTrips: Number,
            brandName: String
        }
    ]
}));
