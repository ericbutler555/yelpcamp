var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');

// homepage
router.get('/', function(req, res){
  res.render('home.ejs');
});

// auth new
router.get('/register', function(req, res){
  res.render('register.ejs');
});

// auth create
router.post('/register', function(req, res){
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
router.get('/login', function(req, res){
  res.render('login.ejs');
});

// login post
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}), function(req, res){
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
