const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
  userId: {
    type: String,
    default: ''
  },
  collectionId:{
    type: String,
    default: ''
  },
  pass:{
    type: String,
    default: ''
  },
  time:{
    type: Number,
    default: '',
  },
  numberOfQuestion:{
    type: Number,
    default: ''
  }
});

module.exports = mongoose.model('Exam', examSchema);
