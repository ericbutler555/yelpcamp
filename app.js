var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// expose the public folder:
app.use(express.static('public'));

// enable body parser for parsing form submission values:
app.use(bodyParser.urlencoded({ extended: true }));

// routes:

app.get('/', function(req, res){
  res.render('home.ejs');
});

var campgrounds = [
  { name: "Salmon Creek", image: "https://pixabay.com/get/e834b70c2cf5083ed1584d05fb1d4e97e07ee3d21cac104496f1c17ca4ebb6b9_340.jpg" },
  { name: "Granite Hill", image: "https://pixabay.com/get/ea31b10929f7063ed1584d05fb1d4e97e07ee3d21cac104496f1c17ca4ebb6b9_340.jpg" },
  { name: "Mountain Goat’s Rest", image: "https://pixabay.com/get/e136b60d2af51c22d2524518b7444795ea76e5d004b0144294f0c47aa1eeb4_340.jpg" }
];

app.get('/campgrounds', function(req, res){
  res.render('campgrounds.ejs', {
    campgrounds: campgrounds
  });
});

app.post('/campgrounds', function(req, res){
  campgrounds.push({
    name: req.body.campName,
    image: req.body.campImage
  });
  res.redirect('/campgrounds');
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
