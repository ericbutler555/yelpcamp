var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');

var middleware = require('../middleware'); // implies 'index.js'

// campgrounds index (and new)
router.get('/campgrounds', function(req, res){
  // get all campgrounds from db:
  Campground.find({}, function(error, data){
    if (error) {
      console.log(error);
      req.flash('danger', 'Sorry, something went wrong.');
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
router.post('/campgrounds', middleware.isLoggedIn, function(req, res){
  Campground.create({
    name: req.body.campName,
    image: req.body.campImage,
    description: req.body.campDescription,
    price: req.body.campPrice,
    author: {
      id: req.user._id,
      username: req.user.username
    }
  }, function(error, data){
    if (error) {
      console.log(error);
      req.flash('danger', 'Sorry, something went wrong.');
      res.redirect('/campgrounds');
    } else {
      console.log('New campground added: ' + data);
      req.flash('success', 'New campground added.');
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
      req.flash('danger', 'Sorry, something went wrong.');
      res.redirect('/campgrounds');
    } else {
      res.render('campgrounds/show.ejs', {
        campground: data
      });
    }
  });
});

// campgrounds edit
router.get('/campgrounds/:id/edit', middleware.isCampgroundAuthor, function(req, res){
  Campground.findById(req.params.id, function(error, data){
    res.render('campgrounds/edit.ejs', {
      campground: data
    });
  }); // end findById
});

// campground update
router.put('/campgrounds/:id', middleware.isCampgroundAuthor, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
    } else {
      req.flash('success', 'Campground updated.');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// campground destroy
router.delete('/campgrounds/:id', middleware.isCampgroundAuthor, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      console.log(err);
      req.flash('danger', 'Sorry, something went wrong.');
    } else {
      console.log('campground deleted');
      req.flash('success', 'Campground deleted.');
    }
    res.redirect('/campgrounds');
  });
});

module.exports = router;
