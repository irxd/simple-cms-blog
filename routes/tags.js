var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override');
var passport = require('passport');
var author = require('../model/authors');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

//Get blog content for home
router.get('/:tag', function(req, res, next) {
//var tags = req.params.name;
//var value = req.params.tag;
//var query = {};
//query[tags] = value;
//  var a = req.params.tag; 
//  var b = "'" + a + "'";
//  query = {};
//  query[tags]
//  console.log(b);
  mongoose.model('Article').find({tags : req.params.tag}, function (err, articles) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        //HTML responds -> index.jade
        html: function() {
          res.render('articles/index', {
            title: 'Tagged article',
            "articles" : articles,
            user : req.user
          });
        },
        //JSON responds
        json: function() {
          res.json(articles);
        }
      });
    }     
  });
});

module.exports = router;