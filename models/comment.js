var mongoose = require('mongoose');

// set up the comment database schema:
var commentSchema = mongoose.Schema({
  text: String,
  author: String
});

module.exports = mongoose.model("Comment", commentSchema);
