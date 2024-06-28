const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  userId: {
    type: String,
    default: ''
  },
  examId:{
    type: String,
    default: ''
  },
  score:{
    type: Number,
    default: ''
  }
});


module.exports = mongoose.model('Enrollment', enrollmentSchema);
