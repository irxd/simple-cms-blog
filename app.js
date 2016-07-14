var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); 
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var db = require('./model/db');
var article = require('./model/articles');
var author = require('./model/authors');
var category = require('./model/categories');

var routes = require('./routes/index');
var articles = require('./routes/articles');
var categories = require('./routes/categories');
var tags = require('./routes/tags');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// moment js
app.locals.moment = require("momentjs");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// for passport
app.use(session({
  secret: 'younameit',
  resave: false,
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(flash());
app.use(passport.session()); // persistent login sessions

app.use('/', routes);
app.use('/articles', articles);
app.use('/categories', categories);
app.use('/tags', tags);

// passport config
passport.use(new LocalStrategy(author.authenticate()));
passport.serializeUser(author.serializeUser());
passport.deserializeUser(author.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
