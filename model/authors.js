var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var authorSchema = new mongoose.Schema({  
  username: { type : String },
  password: { type : String }
});

authorSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Author', authorSchema);