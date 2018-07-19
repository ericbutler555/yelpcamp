var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var passport = require('passport');
var localStrategy = require('passport-local');
var expressSession = require('express-session');

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

// define auth middleware:
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

// pass method to check for user session into every route:
app.use(function(req, res, next){
  // res.locals stores data across all routes
  // req.user is built-in passport data storage for user info
  res.locals.user = req.user;
  next();
});

// routes:

// homepage
app.get('/', function(req, res){
  res.render('home.ejs');
});

// auth new
app.get('/register', function(req, res){
  res.render('register.ejs');
});

// auth create
app.post('/register', function(req, res){
  // create new user instance:
  User.register(new User({
    username: req.body.username
  }), req.body.password, function(err, data){
    if (err) {
      console.log(err);
      res.render('register.ejs');
    } else {
      // log user in via local-style auth:
      passport.authenticate('local')(req, res, function(){
        res.redirect('/campgrounds');
      });
    }
  });
});

// login
app.get('/login', function(req, res){
  res.render('login.ejs');
});

// login post
app.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), function(req, res){
});

// logout
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
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

// comment new (must be logged-in to access)
app.get('/campgrounds/:id/comments/new', isLoggedIn, function(req, res){
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

// comment create (must be logged-in to process)
app.post('/campgrounds/:id/comments', isLoggedIn, function(req, res){
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
