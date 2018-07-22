var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middlewareObject = {};

// check if user is logged in:
middlewareObject.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'You must be logged in to do this.');
    res.redirect('/login');
  }
}

// check authorship of a campground entry:
middlewareObject.isCampgroundAuthor = function(req, res, next) {
  if (req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, data){
      if (err) {
        console.log(err);
        req.flash('danger', 'Sorry, something went wrong.');
        res.redirect('back');
      } else {
        if (data.author.id && data.author.id.equals(req.user._id)){
          return next();
        } else {
          req.flash('danger', 'Only the author of this campground may do this.');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('danger', 'You must be logged in to do this.');
    res.redirect('back');
  }
}

// check authorship of a comment:
middlewareObject.isCommentAuthor = function(req, res, next) {
  if (req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, data){
      if (err) {
        console.log(err);
        req.flash('danger', 'Sorry, something went wrong.');
        res.redirect('back');
      } else {
        if (data.author.id && data.author.id.equals(req.user._id)){
          return next();
        } else {
          req.flash('danger', 'Only the author of this comment may do this.');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('danger', 'You must be logged in to do this.');
    res.redirect('back');
  }
}

module.exports = middlewareObject;
