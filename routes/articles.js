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

router.route('/')
  //Get blog content for url/articles
  .get(isLoggedIn, function(req, res, next) {
    mongoose.model('Article').find({}, function (err, articles) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          //HTML responds -> articles/index.jade
          html: function() {
            res.render('articles/index', {
            title: 'All my Articles',
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
  })
  //Create new article
  .post(function(req, res) {
    //Get values from forms in url/articles/new
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    var tags = req.body.tags;
    var draft = req.body.draft;
    //Create function for mongo
    mongoose.model('Article').create({
      title : title,
      body : body,
      category : category,
      tags : tags,
      draft : draft
    }, function (err, article) {
        if (err) {
          res.send("POST failed to save data.");
        } else {
          //Article succesfully created
          console.log('POST creating new article: ' + article);
            res.format({
              //HTML responds
              html: function() {
                res.location("articles");
                //Redirect to url/articles after creating articles
                res.redirect("/articles");
              },
              //JSON responds
              json: function() {
                res.json(article);
              }
            });
        }
    })
  });

//Page for creating new article
router.get('/new', function(req, res) {
  mongoose.model('Category').find({}, function (err, categories) {
    if (err) {
      return console.error(err);
    } else {
      res.render('articles/new', { 
      title: 'Add New Article',
      "categories" : categories,
      user : req.user 
    });
    }
  });    
});

//Middleware to validate id
router.param('id', function(req, res, next, id) {
  //Find the ID in the Mongo
  mongoose.model('Article').findById(id, function (err, article) {
    //If it isn't found, respond with 404
    if (err) {
      console.log(id + ' was not found');
      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function(){
          next(err);
        },
        json: function(){
          res.json({message : err.status  + ' ' + err});
        }
      });
    } else {
      console.log(article);
      req.id = id;
      next(); 
        } 
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Article').findById(req.id, function (err, article) {
      if (err) {
        console.log('GET error retrieving data: ' + err);
      } else {
        console.log('GET retrieving ID: ' + article._id);
        res.format({
          html: function(){
              res.render('articles/show', {
                "article" : article,
                user : req.user 
              });
          },
          json: function(){
              res.json(article);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	//Get article by Mongo ID
	.get(function(req, res) {
	  //Search article in Mongo
	  mongoose.model('Article').findById(req.id, function (err, article) {
	    if (err) {
	      console.log('GET error retrieving data: ' + err);
	    } else {
	      console.log('GET retrieving ID: ' + article._id);
	      res.format({
	        //HTML responds -> url/articles/edit
	        html: function() {
	          res.render('articles/edit', {
	            title: 'Article' + article._id,
	            "article" : article,
              user : req.user 
	           });
	        },
	        //JSON responds
	        json: function() {
	          res.json(article);
	        }
	      });
	    }
	  });
	})
	//Update article by ID
	.put(function(req, res) {
	  //Get values from forms in url/articles/edit
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    var tags = req.body.tags;
    var draft = req.body.draft;
	  //Find article by ID
	  mongoose.model('Article').findById(req.id, function (err, article) {
	    //Update article
	    article.update({
        title : title,
        body : body,
        category : category,
        tags : tags,
        draft : draft
	    }, function (err, articleID) {
	        if (err) {
	          res.send("PUT error updating data: " + err);
	        } else {
	          //HTML responds
	          res.format({
	            html: function(){
	              res.redirect("/articles/" + article._id);
	            },
	            //JSON responds
	            json: function(){
	              res.json(article);
	            }
	          });
	        }
	    })
	  });
	})
	//Delete article by ID
	.delete(function (req, res){
	  //Find article by ID
	  mongoose.model('Article').findById(req.id, function (err, article) {
	    if (err) {
	      return console.error(err);
	    } else {
	      //Delete article in Mongo
	      article.remove(function (err, article) {
	        if (err) {
	          return console.error(err);
	        } else {
	          console.log('DELETE removing ID: ' + article._id);
	          res.format({
	            //HTML responds -> url/articles
	            html: function(){
	            res.redirect("/articles");
	            },
	            //JSON responds
	            json: function(){
	              res.json({message : 'deleted',
	              item : article
	              });
	            }
	          });
	        }
	      });
	    }
	  });
	});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;