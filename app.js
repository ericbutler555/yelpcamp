var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// connect to the MongoDB database:
mongoose.connect('mongodb://localhost/yelpcamp');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// expose the public folder:
app.use(express.static('public'));

// enable body parser for parsing form submission values:
app.use(bodyParser.urlencoded({ extended: true }));

// set up the campground database schema:
var campgroundSchema = mongoose.Schema({
  name: String,
  image: String,
  description: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

// routes:

app.get('/', function(req, res){
  res.render('home.ejs');
});

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

app.get('/campgrounds/:id', function(req, res){
  Campground.findById(req.params.id, function(error, data){
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
