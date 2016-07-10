var mongoose = require('mongoose');  
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({  
  username: {
    type : String,
    unique : true,
    required : true
  },
  password: {
    type : String,
    required : true 
  }
},
{
  timestamps: true
});

// Execute before each user.save() call
userSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

mongoose.model('User', userSchema);