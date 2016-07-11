var mongoose = require('mongoose');  

var categorySchema = new mongoose.Schema({  
  name: { type : String }
});

mongoose.model('Category', categorySchema);