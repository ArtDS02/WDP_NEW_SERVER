const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositSchema = new Schema({
  userId: {
    type: String,
    default: ''
  },
  number:{
    type: Number,
    default: 0
  },
  content:{
    type: String,
    default: ''
  },
  status:{
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Deposit', depositSchema);
