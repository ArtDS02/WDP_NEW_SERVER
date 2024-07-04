const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  examId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam' 
  },
  score:{
    type: Number,
    default: ''
  }
});


module.exports = mongoose.model('Enrollment', enrollmentSchema);
