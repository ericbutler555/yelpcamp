var express = require('express');
var router = express.Router();

var Campground = require('../models/campground');

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
router.post('/campgrounds', function(req, res){
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
router.get('/campgrounds/:id/edit', function(req, res){
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
router.put('/campgrounds/:id', function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

// campground destroy
router.delete('/campgrounds/:id', function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      console.log(err);
    }
    res.redirect('/campgrounds');
  });
});

module.exports = router;
