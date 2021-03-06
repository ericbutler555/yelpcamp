var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var passport = require('passport');
var localStrategy = require('passport-local');
var expressSession = require('express-session');
var flash = require('connect-flash');

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

// enable flash messages (must come BEFORE passport init):
app.use(flash());

// bring in models:
var Campground = require('./models/campground');
var Comment = require('./models/comment');
var User = require('./models/user');

// seed the db with comments using the logic in seeds.js:
// var seedDb = require('./seeds');
// seedDb();

// enable express-session package:
app.use(expressSession({
  secret: "Very secret passphrase to sign the session cookie with",
  resave: false,
  saveUninitialized: false
}));
// initialize passport and its sessions:
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass method to check for user session into every route:
app.use(function(req, res, next){
  // res.locals stores data across all routes
  // req.user is built-in passport data storage for user info
  res.locals.user = req.user;
  res.locals.flash_message = req.flash();
  next();
});

// routes:

var indexRoutes = require('./routes/index');
app.use(indexRoutes);

var campgroundsRoutes = require('./routes/campgrounds');
app.use(campgroundsRoutes);

var commentsRoutes = require('./routes/comments');
app.use(commentsRoutes);

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
