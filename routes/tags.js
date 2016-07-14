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

// get all content for url/tags/tag's name
router.get('/:tag', function(req, res, next) {
  mongoose.model('Article').find({
    tags : req.params.tag, draft : false}, function (err, articles) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          // HTML responds -> index.jade with all tagged article
          html: function() {
            res.render('index', {
              title: 'All articles Tagged as ' + req.params.tag,
              "articles" : articles,
              user : req.user
            });
          },
          // JSON responds
          json: function() {
            res.json(articles);
          }
        });
      }     
  });
});

module.exports = router;