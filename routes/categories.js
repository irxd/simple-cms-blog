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
  // get all content for url/categories
  .get(isLoggedIn, function(req, res, next) {
    mongoose.model('Category').find({}, function (err, categories) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          // HTML responds -> categories/index.jade
          html: function() {
            res.render('categories/index', {
            title: 'All Categories',
            "categories" : categories,
            user : req.user
            });
          },
          // JSON responds
          json: function() {
            res.json(categories);
          }
        });
      }     
    });
  })
  // for create new category
  .post(isLoggedIn, function(req, res) {
    // get values from forms in url/categories/new
    var name= req.body.name;
    // create function for mongo
    mongoose.model('Category').create({
      name : name,
    }, function (err, category) {
        if (err) {
          res.send("POST failed to save data.");
        } else {
          // category succesfully created
          console.log('POST creating new category: ' + category);
            res.format({
              // HTML responds
              html: function() {
                res.location("categories");
                // redirect to url/categories after creating categories
                res.redirect("/categories");
              },
              // JSON responds
              json: function() {
                res.json(category);
              }
            });
        }
    })
  });

// page for creating new category
router.get('/new', isLoggedIn, function(req, res) {
  res.render('categories/new', { 
    title: 'Add New Category',
    user : req.user 
  });
});

// middleware to validate id
router.param('id', function(req, res, next, id) {
  // find the id in the mongo
  mongoose.model('Category').findById(id, function (err, category) {
    // if it isn't found, respond with 404
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
      console.log(category);
      req.id = id;
      next(); 
        } 
    });
});

// for editing category by id
router.route('/:id/edit')
	// get category by id
	.get(isLoggedIn, function(req, res) {
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    if (err) {
	      console.log('GET error retrieving data: ' + err);
	    } else {
	      console.log('GET retrieving ID: ' + category._id);
	      res.format({
	        // HTML responds -> categories/edit.jade
	        html: function() {
	          res.render('categories/edit', {
	            title: 'Category' + category._id,
	            "category" : category,
              user : req.user 
	           });
	        },
	        // JSON responds
	        json: function() {
	          res.json(category);
	        }
	      });
	    }
	  });
	})

	// update category by id
	.put(isLoggedIn, function(req, res) {
	  // get values from forms in url/categories/edit
    var name = req.body.name;
	  // find category by id
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    // update category
	    category.update({
        name : name
	    }, function (err, categoryID) {
	        if (err) {
	          res.send("PUT error updating data: " + err);
	        } else {
	          //HTML responds
	          res.format({
	            html: function(){
	              res.redirect("/categories");
	            },
	            //JSON responds
	            json: function(){
	              res.json(category);
	            }
	          });
	        }
	    })
	  });
	})

	// delete category by id
	.delete(isLoggedIn, function (req, res){
	  // find category by id
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    if (err) {
	      return console.error(err);
	    } else {
	      // delete category in mongo
	      category.remove(function (err, category) {
	        if (err) {
	          return console.error(err);
	        } else {
	          console.log('DELETE removing ID: ' + category._id);
	          res.format({
	            // HTML responds
	            html: function(){
	            res.redirect("/categories");
	            },
	            // JSON responds
	            json: function(){
	              res.json({message : 'deleted',
	              item : category
	              });
	            }
	          });
	        }
	      });
	    }
	  });
	});

// get all content for url/categories/category's name
router.get('/:category', function(req, res, next) {
  mongoose.model('Article').find({category : req.params.category, draft : false}, function (err, articles) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        // HTML responds -> index.jade with all article in requested category
        html: function() {
          res.render('index', {
            title: 'All articles in ' + req.params.category + ' category',
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

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

module.exports = router;