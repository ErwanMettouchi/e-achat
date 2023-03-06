require('./database/bddconnect');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var categoriesRouter = require('./routes/categories');
var sousCategoriesRouter = require('./routes/sub-categories');
var marqueRouter = require('./routes/marques');
var adminRouter = require('./routes/admin');


var session = require("express-session");

var app = express();

app.use( 
  session({  
  secret: 'a4f8071f-c873-4447-8ee2', 
  resave: false, 
  saveUninitialized: false,
  cookie : {
   maxAge : 60000
  }
   }) ,
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/categories', categoriesRouter);
app.use('/sub-categories', sousCategoriesRouter);
app.use('/brand', marqueRouter);
app.use('/admin', adminRouter);

app.locals.dateFormat = function(date){
  let newDate = new Date(date)
  let jourDuMois = newDate.getDate()
  let mois = newDate.getMonth()+1
  let annee = newDate.getFullYear()
  if(jourDuMois < 10) {
    jourDuMois = "0" + jourDuMois
  }
  if(mois < 10){
    mois = "0" + mois
  }
  return jourDuMois + "/" + mois + "/" + annee
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return res.status(404).render('404');
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
