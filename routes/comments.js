var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');
var Comment = require('../models/comment');

// define auth middleware:
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

// comment new (must be logged-in to access)
router.get('/campgrounds/:id/comments/new', isLoggedIn, function(req, res){
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
router.post('/campgrounds/:id/comments', isLoggedIn, function(req, res){
  Comment.create(req.body.comment, function(err, theComment){
    if (err) {
      console.log(err);
    } else {
      Campground.findById(req.params.id, function(err, camp){
        if (err) {
          console.log(err);
        } else {
          // save logged-in user data to comment:
          theComment.author.id = req.user._id;
          theComment.author.username = req.user.username;
          theComment.save();
          // add the comment to this campground:
          camp.comments.push(theComment);
          camp.save();
        }
      });
    }
    res.redirect('/campgrounds/' + req.params.id);
  });
});

module.exports = router;
