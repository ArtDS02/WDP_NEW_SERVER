const express = require('express');
const bodyParser = require('body-parser');
const Collection = require('../models/collection');
const authenticate = require('../authen/authenticate');
const Question = require('../models/question');


const collectionRouter = express.Router();
collectionRouter.use(bodyParser.json());

// Route to get all collections by the current user
collectionRouter.get('/mycollections', authenticate.verifyUser, async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming authenticate.verifyUser adds the user to req
    const collections = await Collection.find({ userId }).populate('userId').exec();
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections', error });
  }
});

// Route to create a new collection  //Done
collectionRouter.post('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    // Create question documents from the request body
    const questionPromises = req.body.questions.map(question => new Question(question).save());
    const questionDocs = await Promise.all(questionPromises);
    const questionIds = questionDocs.map(question => question._id);

    // Create the new collection document
    const newCollection = new Collection({
      userId: req.user ? req.user._id : null, // Assign userId if available, else set to null
      name: req.body.name,
      numberOfQuestion: req.body.numberOfQuestion,
      price: req.body.price,
      questions: questionIds
    });

    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    next(error);
  }
});

// Route để thêm collection mới (dùng cho add file)
collectionRouter.post('/addCollection', async (req, res) => {
  const { userId, name, numberOfQuestion, price, questions } = req.body;

  try {
    // Tạo một instance của Collection
    const newCollection = new Collection({
      userId,
      name,
      numberOfQuestion,
      price,
      questions
    });

    // Lưu collection vào cơ sở dữ liệu
    const savedCollection = await newCollection.save();

    // Trả về response thành công
    res.status(201).json(savedCollection);
  } catch (err) {
    // Xử lý lỗi nếu có
    console.error(err);
    res.status(500).json({ error: 'Lỗi server, không thể thêm collection' });
  }
});

// Route to get all collections //Done
collectionRouter.get('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const collections = await Collection.find({})
      .populate('userId'); 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

// Route to delete a question in every collections contain it by QuestionId //Done
collectionRouter.delete('/deleteQuestion/:questionId', authenticate.verifyUser, async (req, res, next) => {
  const { questionId } = req.params;

  try {
    
    const result = await Collection.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send('No collections found with the given questionId or questionId not found in any collection');
    }
    
    res.status(200).send(`Removed questionId: ${questionId} from ${result.modifiedCount} collections`);
  } catch (error) {
    next(error); 
  }
});

// Route to get a specific collection by ID  //Done
collectionRouter.get('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id })
      .populate('questions'); 
    if (collection) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(collection);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: 'Collection not found or unauthorized access' });
    }
  } catch (err) {
    next(err);
  }
});

// Route to update a collection by ID  //Done
collectionRouter.put('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const updatedCollection = await Collection.findOneAndUpdate(
      { userId: req.user._id, _id: req.params.id },
      { $set: req.body }, 
      { new: true }
    );
    if (updatedCollection) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedCollection);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: 'Collection not found or unauthorized access' });
    }
  } catch (err) {
    next(err);
  }
});

// Route to delete a collection by ID  //Done
collectionRouter.delete('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndDelete({ userId: req.user._id, _id: req.params.id });
    if (collection) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, message: 'Collection deleted' });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.json({ error: 'Collection not found or unauthorized access' });
    }
  } catch (err) {
    next(err);
  }
});

// Route to get a specific collection by ID and random question
// Route to get a specific collection by ID and random question  //Done// Route to get a specific collection by ID and random question
collectionRouter.get('/:id/random/:number', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { id, number } = req.params; // Lấy số lượng câu hỏi từ params

    const collection = await Collection.findOne({ _id: id }).populate('questions');
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found or unauthorized access' });
    }

    // Lấy danh sách câu hỏi từ collection
    const { questions } = collection;

    // Kiểm tra nếu số lượng câu hỏi yêu cầu lớn hơn số câu hỏi thực tế có trong collection
    const totalQuestions = questions.length;
    const count = number > totalQuestions ? totalQuestions : parseInt(number, 10);

    // Hàm để lấy một mảng ngẫu nhiên từ một mảng cho trước
    const getRandomQuestions = (arr, n) => {
      const shuffled = arr.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    // Lấy danh sách câu hỏi ngẫu nhiên
    const randomQuestions = getRandomQuestions(questions, count);

    res.status(200).json(randomQuestions);
  } catch (err) {
    next(err);
  }
});

// Route to update userId to null for a collection
collectionRouter.put('/update-userId/:collectionId', authenticate.verifyUser, async (req, res) => {
  const collectionId = req.params.collectionId;

  try {
    // Tìm collection bằng collectionId
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: 'Không tìm thấy collection' });
    }

    // Cập nhật userId thành null
    collection.userId = null;

    // Lưu collection đã cập nhật
    const updatedCollection = await collection.save();

    res.status(200).json({ message: 'Đã cập nhật userId thành null', collection: updatedCollection });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error });
  }
});


module.exports = collectionRouter;
