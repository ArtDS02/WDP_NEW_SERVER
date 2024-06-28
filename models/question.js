const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  detail: {
    type: String,
    default: ''
  },
  answerA:{
    type: String,
    default: ''
  },
  answerB:{
    type: String,
    default: ''
  },
  answerC:{
    type: String,
    default: ''
  },
  answerD:{
    type: String,
    default: ''
  },
  trueAnswer:{
    type: String,
    default: 'A'
  }
});


module.exports = mongoose.model('Question', questionSchema);
