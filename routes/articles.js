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
  // get all content for url/articles
  .get(isLoggedIn, function(req, res, next) {
    mongoose.model('Article').find({}, function (err, articles) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          // HTML responds -> articles/index.jade
          html: function() {
            res.render('articles/index', {
            title: 'All Articles',
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
  })

  // for post new article
  .post(isLoggedIn, function(req, res) {
    // get values from forms in url/articles/new
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    var tags = req.body.tags;
    var draft = req.body.draft;
    var author = req.user.username;
    // create function for mongo
    mongoose.model('Article').create({
      title : title,
      body : body,
      category : category,
      tags : tags,
      draft : draft,
      author : author
    }, function (err, article) {
        if (err) {
          res.send("POST failed to save data.");
        } else {
          // article succesfully created
          console.log('POST creating new article: ' + article);
            res.format({
              // HTML responds
              html: function() {
                res.location("articles");
                // redirect to url/articles after creating articles
                res.redirect("/articles");
              },
              // JSON responds
              json: function() {
                res.json(article);
              }
            });
        }
    })
  });

// page for creating new article
router.get('/new', isLoggedIn, function(req, res) {
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

// page for published article
router.get('/published', isLoggedIn, function(req, res) {
  mongoose.model('Article').find({draft : false}, function (err, articles) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          // HTML responds -> articles/index.jade with all published articles
          html: function() {
            res.render('articles/index', {
            title: 'All Published Articles',
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

// page for draft article
router.get('/draft', isLoggedIn,function(req, res) {
  mongoose.model('Article').find({draft : true}, function (err, articles) {
      if (err) {
        return console.error(err);
      } else {
        res.format({
          // HTML responds -> articles/index.jade with all draft articles
          html: function() {
            res.render('articles/index', {
            title: 'All Draft Articles',
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

// middleware to validate id
router.param('id', function(req, res, next, id) {
  // find the id in the mongo
  mongoose.model('Article').findById(id, function (err, article) {
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
      console.log(article);
      req.id = id;
      next(); 
        } 
    });
});

// get individual article by id
router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Article').findById(req.id, function (err, article) {
      if (err) {
        console.log('GET error retrieving data: ' + err);
      } else {
        console.log('GET retrieving ID: ' + article._id);
        res.format({
          // HTML responds -> articles/show.jade
          html: function(){
              res.render('articles/show', {
                "article" : article,
                user : req.user 
              });
          },
          // JSON responds
          json: function(){
              res.json(article);
          }
        });
      }
    });
  });

// for editing article by id
router.route('/:id/edit')
  .get(isLoggedIn, function(req, res) {
    // search category to display it in edit form
    mongoose.model('Category').find({}, function (err, category){ 
      // map the category to pass it
      var category2 = category.map(function(categ) {return categ});
      // search article by id
      mongoose.model('Article').findById(req.id, function (err, article) {
        if (err) {
          console.log('GET error retrieving data: ' + err);
        } else {
          // check the right author
          if(article.author == req.user.username){
            console.log('GET retrieving ID: ' + article._id);
            res.format({
              // HTML responds -> articles/edit.jade
              html: function() {
                res.render('articles/edit', {
                  title: 'Article' + article._id,
                  "article" : article,
                  user : req.user,
                  draft : article.draft,
                  "categories" : category2
                 });
              },
              // JSON responds
              json: function() {
                res.json(article);
              }
            });
          } else {
            res.format({
              html: function() {
                res.render('notauthor', {
                  message: "You're not authorized.",
                  user : req.user
                 });
              }
            });
          }
        }
      });
    });
  })

  // update article by id
  .put(isLoggedIn, function(req, res) {
    // get values from forms in url/articles/edit
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    var tags = req.body.tags.split(',');
    var draft = req.body.draft;
    // find article by id
    mongoose.model('Article').findById(req.id, function (err, article) {
      // update article
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
            // HTML responds 
            res.format({
              html: function(){
                res.redirect("/articles");
              },
              // JSON responds
              json: function(){
                res.json(article);
              }
            });
          }
      })
    });
  })

  // delete article by id
  .delete(isLoggedIn, function (req, res){
    // find article by id
    mongoose.model('Article').findById(req.id, function (err, article) {
      if (err) {
        return console.error(err);
      } else {
        // check the right author
        if(article.author == req.user.username){
          // delete article in mongo
          article.remove(function (err, article) {
            if (err) {
              return console.error(err);
            } else {
                console.log('DELETE removing ID: ' + article._id);
                res.format({
                  // HTML responds
                  html: function(){
                  res.redirect("/articles");
                  },
                  // JSON responds
                  json: function(){
                    res.json({message : 'deleted',
                    item : article
                    });
                  }
                });
            }
          });
        } else { 
          res.format({
              html: function() {
                res.render('notauthor', {
                  message: "You're not authorized.",
                  user : req.user
                 });
              }
          });
        }
      }
    });
  });

router.route('/:id/publish')
  // get article by id
  .get(isLoggedIn, function(req, res) {
    mongoose.model('Article').findById(req.id, function (err, article) {
      // update article
      if(article.author == req.user.username){
        article.update({draft : false, publishAt : Date.now()}, function (err, articleID) {
            if (err) {
              res.send("PUT error updating data: " + err);
            } else {
              // HTML responds -> articles/draft
              res.format({
                html: function(){
                  res.redirect("/articles/draft");
                },
                // JSON responds
                json: function(){
                  res.json(article);
                }
              });
            }
        })
      } else {
        res.format({
              html: function() {
                res.render('notauthor', {
                  message: "You're not authorized.",
                  user : req.user
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
    res.redirect('/login');
}

module.exports = router;