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

// define authorship middleware:
function isCommentAuthor(req, res, next) {
  if (req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, data){
      if (err) {
        console.log(err);
        res.redirect('back');
      } else {
        if (data.author.id && data.author.id.equals(req.user._id)){
          return next();
        } else {
          console.log('You are not the author of this entry');
          res.redirect('back');
        }
      }
    });
  } else {
    console.log('You must be logged in to do this');
    res.redirect('back');
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

// comment edit
router.get('/campgrounds/:id/comments/:comment_id/edit', isCommentAuthor, function(req, res){
  Comment.findById(req.params.comment_id, function(err, data){
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.render('comments/edit.ejs', {
        campgroundId: req.params.id,
        comment: data
      });
    } // end else
  });
});

// comment update
router.put('/campgrounds/:id/comments/:comment_id', isCommentAuthor, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, data){
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// comment delete
router.delete('/campgrounds/:id/comments/:comment_id', isCommentAuthor, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log('Comment deleted');
    }
    res.redirect('/campgrounds/' + req.params.id);
  });
});


module.exports = router;
