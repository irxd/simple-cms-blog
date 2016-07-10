var mongoose = require('mongoose');  

var categorySchema = new mongoose.Schema({  
  name: { type : String }
},
{
  timestamps: true
});

mongoose.model('Category', categorySchema);