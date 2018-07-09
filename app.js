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
  image: String
});
var Campground = mongoose.model("Campground", campgroundSchema);

// Try adding one to the db (temporary, for testing only):
// Campground.create({
//   name: "Salmon Creek",
//   image: "https://pixabay.com/get/e834b70c2cf5083ed1584d05fb1d4e97e07ee3d21cac104496f1c17ca4ebb6b9_340.jpg"
// }, function(error, response){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('item added: ' + response);
//   }
// });

// routes:

app.get('/', function(req, res){
  res.render('home.ejs');
});

// (Removing this as we move the data into the database)
// var campgrounds = [
//   { name: "Salmon Creek", image: "https://pixabay.com/get/e834b70c2cf5083ed1584d05fb1d4e97e07ee3d21cac104496f1c17ca4ebb6b9_340.jpg" },
//   { name: "Granite Hill", image: "https://pixabay.com/get/ea31b10929f7063ed1584d05fb1d4e97e07ee3d21cac104496f1c17ca4ebb6b9_340.jpg" },
//   { name: "Mountain Goat’s Rest", image: "https://pixabay.com/get/e136b60d2af51c22d2524518b7444795ea76e5d004b0144294f0c47aa1eeb4_340.jpg" }
// ];

app.get('/campgrounds', function(req, res){
  // get all campgrounds from db:
  Campground.find({}, function(error, response){
    if (error) {
      console.log(error);
      res.redirect('/');
    } else {
      // render the template, with "campgrounds" now populated by the returned db data:
      res.render('campgrounds.ejs', {
        campgrounds: response
      });
    }
  });
});

app.post('/campgrounds', function(req, res){
  Campground.create({
    name: req.body.campName,
    image: req.body.campImage
  }, function(error, response){
    if (error) {
      console.log(error);
      res.redirect('/campgrounds');
    } else {
      console.log('New campground added: ' + response);
      res.redirect('/campgrounds');
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
