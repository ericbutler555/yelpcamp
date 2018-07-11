var mongoose = require('mongoose');

// set up the user database schema:
var userSchema = mongoose.Schema({
  name: String
});

module.exports = mongoose.model("User", userSchema);
