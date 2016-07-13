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
  //Get blog content for url/categories
  .get(isLoggedIn, function(req, res, next) {
    mongoose.model('Category').find({}, function (err, categories) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          //HTML responds -> categories/index.jade
          html: function() {
            res.render('categories/index', {
            title: 'All my Categories',
            "categories" : categories,
            user : req.user
            });
          },
          //JSON responds
          json: function() {
            res.json(categories);
          }
        });
      }     
    });
  })
  //Create new category
  .post(isLoggedIn, function(req, res) {
    //Get values from forms in url/categories/new
    var name= req.body.name;
    //Create function for mongo
    mongoose.model('Category').create({
      name : name,
    }, function (err, category) {
        if (err) {
          res.send("POST failed to save data.");
        } else {
          //Category succesfully created
          console.log('POST creating new category: ' + category);
            res.format({
              //HTML responds
              html: function() {
                res.location("categories");
                //Redirect to url/categories after creating categories
                res.redirect("/categories");
              },
              //JSON responds
              json: function() {
                res.json(category);
              }
            });
        }
    })
  });

//Page for creating new category
router.get('/new', isLoggedIn, function(req, res) {
  res.render('categories/new', { 
    title: 'Add New Categoty',
    user : req.user 
  });
});

//Middleware to validate id
router.param('id', function(req, res, next, id) {
  //Find the ID in the Mongo
  mongoose.model('Category').findById(id, function (err, category) {
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
      console.log(category);
      req.id = id;
      next(); 
        } 
    });
});

router.route('/:id/edit')
	//Get category by Mongo ID
	.get(isLoggedIn, function(req, res) {
	  //Search category in Mongo
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    if (err) {
	      console.log('GET error retrieving data: ' + err);
	    } else {
	      console.log('GET retrieving ID: ' + category._id);
	      res.format({
	        //HTML responds -> url/categories/edit
	        html: function() {
	          res.render('categories/edit', {
	            title: 'Category' + category._id,
	            "category" : category,
              user : req.user 
	           });
	        },
	        //JSON responds
	        json: function() {
	          res.json(category);
	        }
	      });
	    }
	  });
	})
	//Update category by ID
	.put(isLoggedIn, function(req, res) {
	  //Get values from forms in url/categories/edit
    var name = req.body.name;
	  //Find category by ID
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    //Update category
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
	//Delete category by ID
	.delete(isLoggedIn, function (req, res){
	  //Find category by ID
	  mongoose.model('Category').findById(req.id, function (err, category) {
	    if (err) {
	      return console.error(err);
	    } else {
	      //Delete category in Mongo
	      category.remove(function (err, category) {
	        if (err) {
	          return console.error(err);
	        } else {
	          console.log('DELETE removing ID: ' + category._id);
	          res.format({
	            //HTML responds -> url/categories
	            html: function(){
	            res.redirect("/categories");
	            },
	            //JSON responds
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

//Get blog content for home
router.get('/:category', function(req, res, next) {
//var tags = req.params.name;
//var value = req.params.tag;
//var query = {};
//query[tags] = value;
//  var a = req.params.tag; 
//  var b = "'" + a + "'";
//  query = {};
//  query[tags]
//  console.log(b);
  mongoose.model('Article').find({category : req.params.category, draft : false}, function (err, articles) {
    if (err) {
      return console.error(err);
    } else {
      res.format({
        //HTML responds -> index.jade
        html: function() {
          res.render('index', {
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

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;