const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Question = require('../models/question');
const Collection = require('../models/collection');
const passport = require('passport');
const authenticate = require('../authen/authenticate');
const mammoth = require('mammoth');


const questionRouter = express.Router();
questionRouter.use(bodyParser.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to create a new question //Done
questionRouter.post('/', authenticate.verifyUser, (req, res, next) => {
  Question.create(req.body)
    .then(question => {
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.json(question);
    })
    .catch(err => next(err));
});

// Route to get all questions (Only admin)  //Done
questionRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Question.find({})
    .then(questions => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(questions);
    })
    .catch(err => next(err));
});

// Router to get random number of questions by number //Done
questionRouter.get('/random/:number', authenticate.verifyUser, (req, res, next) => {
  Question.find({})
    .then(questions => {
      if (questions) {
        let randomQuestions = questions.sort(() => Math.random() - 0.5).slice(0, req.params.number);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(randomQuestions);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Question not found' });
      }
    })
    .catch(err => next(err));
});

// Route to get a specific question by ID //Done
questionRouter.get('/:id', authenticate.verifyUser, (req, res, next) => {
  Question.findById(req.params.id)
    .then(question => {
      if (question) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(question);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Question not found' });
      }
    })
    .catch(err => next(err));
});

// Route to update a question by ID //Done
questionRouter.put('/:id', authenticate.verifyUser, (req, res, next) => {
  Question.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    .then(question => {
      if (question) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(question);
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Question not found' });
      }
    })
    .catch(err => next(err));
});

// Route to delete a question by ID //Done
questionRouter.delete('/:id', authenticate.verifyUser, (req, res, next) => {
  Question.findByIdAndDelete(req.params.id)
    .then(question => {
      if (question) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'Question deleted' });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Question not found' });
      }
    })
    .catch(err => next(err));
});

//Router to delete question in Question and Collection which contain questionId by Id
// questionRouter.delete('/delete/:id', authenticate.verify, (req, res, next) => {
  // Question.findByIdAndDelete(req.params.id)
  //   .then(question => {
  //     if (question) {
  //       res.statusCode = 200;
  //       res.setHeader('Content-Type', 'application/json');
  //       res.json({ success: true, message: 'Question deleted' });
  //     } else {
  //       res.statusCode = 404;
  //       res.setHeader('Content-Type', 'application/json');
  //       res.json({ error: 'Question not found' });
  //     }
  //   })
  
// });

// Route to add a list of questions
questionRouter.post('/add-many', async (req, res) => {
  const { questions } = req.body; // Assumption: req.body là một đối tượng JSON có thuộc tính 'questions' là một mảng các câu hỏi
  
  try {
    const questionIds = [];
    for (let i = 0; i < questions.length; i++) {
      const { detail, answerA, answerB, answerC, answerD, trueAnswer } = questions[i];
      
      // Tạo một câu hỏi mới từ model Question
      const newQuestion = new Question({
        detail,
        answerA,
        answerB,
        answerC,
        answerD,
        trueAnswer
      });
      
      // Lưu câu hỏi vào cơ sở dữ liệu và lấy ra _id (questionId) của câu hỏi đã thêm
      const savedQuestion = await newQuestion.save();
      questionIds.push(savedQuestion._id);
    }

    // Trả về danh sách các questionId đã được thêm vào
    res.status(201).json({ questionIds });
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error(err);
    res.status(500).json({ error: 'Failed to add questions' });
  }
});

// Route to upload questions from a Word file and create a new collection


module.exports = questionRouter;
