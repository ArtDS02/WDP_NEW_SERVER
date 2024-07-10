const express = require('express');
const bodyParser = require('body-parser');
const Exam = require('../models/exam');
const passport = require('passport');
const authenticate = require('../authen/authenticate');

const examRouter = express.Router();
examRouter.use(bodyParser.json());

// Route to create a new Exam //Done
examRouter.post('/', authenticate.verifyUser, (req, res, next) => {
  Exam.create(req.body)
    .then(exam => {
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.json(exam);
    })
    .catch(err => next(err));
});

// Route to get all Exams //Done
examRouter.get('/', authenticate.verifyUser, (req, res, next) => {
  Exam.find({})
    .then(exams => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(exams);
    })
    .catch(err => next(err));
});

// Route to get Exams by Id  //Done
examRouter.get('/:id', authenticate.verifyUser, (req, res, next) => {
    Exam.find({ _id: req.params.id })
      .then(exams => {
        if (exams && exams.length > 0) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(exams);
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({ error: 'Exams not found' });
        }
      })
      .catch(err => next(err));
  });

// Route to get Exams by userId  //Done
examRouter.get('/user/:userId', authenticate.verifyUser, (req, res, next) => {
  Exam.find({ userId: req.params.userId })
    .then(exams => {
      if (exams && exams.length > 0) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(exams);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Exams not found' });
      }
    })
    .catch(err => next(err));
});


// Route to delete an Exam by ID
examRouter.delete('/:id', authenticate.verifyUser, (req, res, next) => {
  Exam.findByIdAndDelete(req.params.id)
    .then(exam => {
      if (exam) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'Exam deleted' });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Exam not found' });
      }
    })
    .catch(err => next(err));
});

// Route to update an exam by ID
examRouter.put('/:id', authenticate.verifyUser, async (req, res) => {
  try {
    const examId = req.params.id;


    // Check if the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }


    // Update the exam with the new details
    const updatedExam = await Exam.findByIdAndUpdate(examId, { $set: req.body }, { new: true });


    res.status(200).json({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



module.exports = examRouter;
