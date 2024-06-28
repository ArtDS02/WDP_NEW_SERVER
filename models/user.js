const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  fullname: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  DOB: {
    type: Date,
    default: ''
  },
  wallet:{
    type:Number,
    default:0
  },
  favoriteCollection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection' 
  }],
  admin: {
    type: Boolean,
    default: false
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
