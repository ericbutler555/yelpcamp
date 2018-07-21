var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');

// define auth middleware:
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

// define authorship middleware:
function isCampgroundAuthor(req, res, next) {
  if (req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, data){
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

// campgrounds index (and new)
router.get('/campgrounds', function(req, res){
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
router.post('/campgrounds', isLoggedIn, function(req, res){
  Campground.create({
    name: req.body.campName,
    image: req.body.campImage,
    description: req.body.campDescription,
    author: {
      id: req.user._id,
      username: req.user.username
    }
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
router.get('/campgrounds/:id', function(req, res){
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
router.get('/campgrounds/:id/edit', isCampgroundAuthor, function(req, res){
  // NOTE: COMMENTS indicate what was moved out to the isCampgroundAuthor middleware:
  // if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(error, data){
      // if (error) {
      //   console.log(error);
      //   res.redirect('/campgrounds/' + req.params.id);
      // } else {
      //   // does this campground entry belong to this user?
      //   if (data.author.id && data.author.id.equals(req.user._id)) {
          res.render('campgrounds/edit.ejs', {
            campground: data
          });
      //   } else {
      //     console.log('Only the author of this campground entry is authorized to edit it.');
      //     res.redirect('/campgrounds/' + req.params.id);
      //   } // end else id's match
      // } // end else error
    }); // end findById
  // } else {
  //   console.log('You must be logged in to edit a campground.');
  //   res.redirect('/campgrounds/' + req.params.id);
  // } // end else isAuthenticated
});

// campground update
router.put('/campgrounds/:id', isCampgroundAuthor, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// campground destroy
router.delete('/campgrounds/:id', isCampgroundAuthor, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log('campground deleted');
    }
    res.redirect('/campgrounds');
  });
});

module.exports = router;
