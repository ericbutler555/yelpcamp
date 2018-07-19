var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// set up the user database schema:
var userSchema = mongoose.Schema({
  name: String,
  password: String
});

// add helpful auth methods to user model:
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
