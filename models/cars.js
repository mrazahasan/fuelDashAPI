// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model Brand for petrol brand and pass it using module.exports
module.exports = mongoose.model('Cars', new Schema({
    model: String,
    year: String,
    company: String
}));