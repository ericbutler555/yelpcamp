var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comment');

function seedDb() {
  // find every campground:
  Campground.find({}, function(err, camps){
    if (err) {
      console.log(err);
    } else {
      // for each campground, create a comment:
      camps.forEach(function(camp){
        Comment.create({
          text: "I would like to comment on this. Thanks.",
          author: "Mike D"
        }, function(err, comment){
          if (err) {
            console.log(err);
          } else {
            // and associate the comment with the campground:
            camp.comments.push(comment);
            camp.save();
          }
        });
      });
    }
  });
}

module.exports = seedDb;
