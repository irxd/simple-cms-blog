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

// get all content for homepage
router.get('/', function(req, res, next) {
  mongoose.model('Article').find({draft : false}, function (err, articles) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        // HTML responds -> index.jade
        html: function() {
          res.render('index', {
            title: 'All articles',
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

// for login page
router.get('/login', function(req, res) {
    res.render('login', { user : req.user, error : req.flash('error') });
});

// login handler
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login', failureFlash: true }), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/articles');
    });
});

// signup handler
router.post('/signup', function(req, res, next) {
  author.register(new author({
    username : req.body.username }), req.body.password, function(err, author) {
      if (err) {
        return res.render('signup', { error : err.message });
      }

      passport.authenticate('local')(req, res, function () {
          req.session.save(function (err) {
              if (err) {
                return next(err);
              }
              res.redirect('/articles');
          });
      });
  });
});

// for logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


module.exports = router;