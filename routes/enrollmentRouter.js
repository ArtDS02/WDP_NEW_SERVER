const express = require('express');
const bodyParser = require('body-parser');
const Enrollment = require('../models/Enrollment');
const authenticate = require('../authen/authenticate');

const enrollmentRouter = express.Router();
enrollmentRouter.use(bodyParser.json());

// Route to create a new Enrollment //Done
enrollmentRouter.post('/', authenticate.verifyUser, (req, res, next) => {
  Enrollment.create(req.body)
    .then(enrollment => {
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.json(enrollment);
    })
    .catch(err => next(err));
});

// Route to get all Enrollments //Done
enrollmentRouter.get('/', authenticate.verifyUser, (req, res, next) => {
  Enrollment.find({})
    .then(enrollments => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(enrollments);
    })
    .catch(err => next(err));
});

// Route to get Enrollments by userId  //Done
enrollmentRouter.get('/user/:userId', authenticate.verifyUser, (req, res, next) => {
  Enrollment.find({ userId: req.params.userId })
    .then(enrollments => {
      if (enrollments && enrollments.length > 0) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(enrollments);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Enrollments not found' });
      }
    })
    .catch(err => next(err));
});

// Route to get Enrollments by examId  //Done
enrollmentRouter.get('/exam/:examId', authenticate.verifyUser, (req, res, next) => {
  Enrollment.find({ examId: req.params.examId })
    .then(enrollments => {
      if (enrollments && enrollments.length > 0) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(enrollments);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Enrollments not found' });
      }
    })
    .catch(err => next(err));
});


// Route to delete an Enrollment by ID
enrollmentRouter.delete('/:id', authenticate.verifyUser, (req, res, next) => {
  Enrollment.findByIdAndDelete(req.params.id)
    .then(enrollment => {
      if (enrollment) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'Enrollment deleted' });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Enrollment not found' });
      }
    })
    .catch(err => next(err));
});

module.exports = enrollmentRouter;
