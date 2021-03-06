var express = require('express.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var popular = require('./routes/popular');
var authors = require('./routes/authors');
var geo = require('./routes/geo');

var app = express();
app.http().io();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// http://stackoverflow.com/a/27464258/1337683
app.use('/stylesheets', express.static(path.join(__dirname, '/node_modules/leaflet/dist'))); 
app.use('/images', express.static(path.join(__dirname, '/node_modules/leaflet/dist/images')))

// Set up URLs
app.use('/', popular.router);
app.use('/authors', authors.router);
app.use('/geo', geo.router);

// Init beat
popular.beat(app);
authors.beat(app);
geo.beat(app);

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

app.listen(5000, function() {
  console.log('http://localhost:5000');
});

module.exports = app;
