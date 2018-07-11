var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');

// connect to the MongoDB database:
mongoose.connect('mongodb://localhost/yelpcamp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// mongodb console cheat sheet:
// show dbs <- see all your databases
// use yelpcamp <- select a db
// show collections <- verify what collections (kinda like tables) are in this db
// db.campgrounds.find() <- returns all campgrounds

// expose the public folder:
app.use(express.static('public'));

// enable body parser for parsing form submission values:
app.use(bodyParser.urlencoded({ extended: true }));

// enable PUT and DELETE requests by appending `?_method=<put|delete>` on form action:
app.use(methodOverride('_method'));

var Campground = require('./models/campground');
var Comment = require('./models/comment');
var User = require('./models/user');

// seed the db with comments using the logic in seeds.js:
// var seedDb = require('./seeds');
// seedDb();

// routes:

app.get('/', function(req, res){
  res.render('home.ejs');
});

// campgrounds index (and new)
app.get('/campgrounds', function(req, res){
  // get all campgrounds from db:
  Campground.find({}, function(error, data){
    if (error) {
      console.log(error);
      res.redirect('/');
    } else {
      // render the template, with "campgrounds" now populated by the returned db data:
      res.render('campgrounds/index.ejs', {
        campgrounds: data
      });
    }
  });
});

// campgrounds create
app.post('/campgrounds', function(req, res){
  Campground.create({
    name: req.body.campName,
    image: req.body.campImage,
    description: req.body.campDescription
  }, function(error, data){
    if (error) {
      console.log(error);
      res.redirect('/campgrounds');
    } else {
      console.log('New campground added: ' + data);
      res.redirect('/campgrounds');
    }
  });
});

// campgrounds show
app.get('/campgrounds/:id', function(req, res){
  // .populate pulls the comments data in with the campground:
  Campground.findById(req.params.id).populate('comments').exec(function(error, data){
    if (error) {
      console.log(error);
      res.redirect('/campgrounds');
    } else {
      res.render('campgrounds/show.ejs', {
        campground: data
      });
    }
  });
});

// campgrounds edit
app.get('/campgrounds/:id/edit', function(req, res){
  Campground.findById(req.params.id, function(error, data){
    if (error) {
      console.log(error);
      res.redirect('/campgrounds/' + req.params.id);
    } else {
      res.render('campgrounds/edit.ejs', {
        campground: data
      });
    }
  });
});

// campground update
app.put('/campgrounds/:id', function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// campground destroy
app.delete('/campgrounds/:id', function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      console.log(err);
    }
    res.redirect('/campgrounds');
  });
});

// comment new
app.get('/campgrounds/:id/comments/new', function(req, res){
  Campground.findById(req.params.id, function(err, data){
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new.ejs', {
        campground: data
      });
    }
  });
});

// comment create
app.post('/campgrounds/:id/comments', function(req, res){
  Comment.create(req.body.comment, function(err, theComment){
    if (err) {
      console.log(err);
    } else {
      Campground.findById(req.params.id, function(err, camp){
        if (err) {
          console.log(err);
        } else {
          camp.comments.push(theComment);
          camp.save();
        }
      });
    }
    res.redirect('/campgrounds/' + req.params.id);
  });
});

// catch all unmatched routes:
app.get('*', function(req, res){
  res.render('home.ejs', {
    flash: "Sorry, the URL you tried to access doesn’t seem to exist."
  });
});

// start the web server:
app.listen(3000, function(){
  console.log('An Express JS server is running on port 3000. Visit http://localhost:3000 in your browser.');
});
