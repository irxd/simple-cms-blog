var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

//Get blog content for home
router.get('/', function(req, res, next) {
  mongoose.model('Article').find({}, function (err, articles) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        //HTML responds -> index.jade
        html: function() {
          res.render('index', {
            title: 'Isi Content',
            "articles" : articles
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