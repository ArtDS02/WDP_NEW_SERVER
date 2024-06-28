const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  numberOfQuestion: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question' 
  }]
});

module.exports = mongoose.model('Collection', collectionSchema);
