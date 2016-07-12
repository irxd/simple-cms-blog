var mongoose = require('mongoose');

var getTags = tags => tags.join(',');
var setTags = tags => tags.split(',');

var articleSchema = new mongoose.Schema({  
  title: { type : String },
  body: { type : String },
  category: { type : String },
  tags: { type : [], get: getTags, set: setTags },
  draft: { type : Boolean, default : false },
  author: { type : String}
},
{
  timestamps: true
});

mongoose.model('Article', articleSchema);