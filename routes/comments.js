var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middleware = require('../middleware'); // implies 'index.js'

// comment new (must be logged-in to access)
router.get('/campgrounds/:id/comments/new', middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, data){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
    } else {
      res.render('comments/new.ejs', {
        campground: data
      });
    }
  });
});

// comment create (must be logged-in to process)
router.post('/campgrounds/:id/comments', middleware.isLoggedIn, function(req, res){
  Comment.create(req.body.comment, function(err, theComment){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
      res.redirect('/campgrounds/' + req.params.id);
    } else {
      Campground.findById(req.params.id, function(err, camp){
        if (err) {
          console.log(err);
          req.flash('danger', 'Sorry, something went wrong.');
        } else {
          // save logged-in user data to comment:
          theComment.author.id = req.user._id;
          theComment.author.username = req.user.username;
          theComment.save();
          // add the comment to this campground:
          camp.comments.push(theComment);
          camp.save();
          req.flash('success', 'New comment added.');
        }
        res.redirect('/campgrounds/' + req.params.id);
      });
    }
  });
});

// comment edit
router.get('/campgrounds/:id/comments/:comment_id/edit', middleware.isCommentAuthor, function(req, res){
  Comment.findById(req.params.comment_id, function(err, data){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
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
router.put('/campgrounds/:id/comments/:comment_id', middleware.isCommentAuthor, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, data){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
      res.redirect('back');
    } else {
      req.flash('success', 'Comment updated.');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// comment delete
router.delete('/campgrounds/:id/comments/:comment_id', middleware.isCommentAuthor, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
    } else {
      req.flash('success', 'Comment deleted.');
      console.log('Comment deleted');
    }
    res.redirect('/campgrounds/' + req.params.id);
  });
});

module.exports = router;
