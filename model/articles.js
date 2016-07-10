var mongoose = require('mongoose');  

var articleSchema = new mongoose.Schema({  
  title: { type : String },
  body: { type : String },
  tags: { type : String }
},
{
  timestamps: true
});

mongoose.model('Article', articleSchema);