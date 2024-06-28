const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const mongoose = require('mongoose'); // Import Mongoose
const passport = require('passport');
const authenticate = require('../authen/authenticate');

const userRouter = express.Router();
userRouter.use(bodyParser.json());

// Route for user signup
userRouter.post("/signup", (req, res, next) => {
  User.register(new User({
    username: req.body.username,
    fullname: req.body.fullname,
    password: req.body.password,
    email: req.body.email,
    DOB: req.body.DOB,
    admin: req.body.admin
  }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    } else {
      passport.authenticate("local")(req, res, () => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "Registration Successful!" });
      });
    }
  });
});

// Route for user login
userRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const token = authenticate.getToken({ _id: user._id });
      res.status(200).json({
        success: true,
        token: token,
        status: 'You are successfully logged in!',
        accountid: user._id,
        admin: user.admin
      });
    });
  })(req, res, next);
});

// Route to get a user by ID
userRouter.get("/:userId", authenticate.verifyUser, (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          DOB: user.DOB,
          favoriteCollection: user.favoriteCollection
        });
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.json({ error: "User not found" });
      }
    })
    .catch((err) => next(err));
});

// Route to update a user by ID
userRouter.put("/:userId", authenticate.verifyUser, (req, res, next) => {
  if (req.user._id.equals(req.params.userId) || req.user.admin) {
    User.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true })
      .then((user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user);
        } else {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.json({ error: "User not found" });
        }
      })
      .catch((err) => next(err));
  } else {
    const err = new Error("You are not authorized to update this user!");
    err.status = 403; // Forbidden status code
    return next(err);
  }
});

// Route to get all users (admin only)
userRouter.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    })
    .catch((err) => next(err));
});


// Route to delete a users by ID //Done
userRouter.delete('/:id', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(question => {
      if (question) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'User deleted' });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({ error: 'Question not found' });
      }
    })
    .catch(err => next(err));
});

// Router to add favorite collection
userRouter.post('/:userId/addCollection', authenticate.verifyUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { collectionId } = req.body;

    if (!collectionId || !mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({ error: 'Valid CollectionID is required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!Array.isArray(user.favoriteCollection)) {
      user.favoriteCollection = [];
    }

    if (!user.favoriteCollection.includes(collectionId)) {
      user.favoriteCollection.push(collectionId);
      await user.save();
    }

    res.status(200).json({ message: 'Collection added successfully', user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// Router to get all favorite Collection
userRouter.get('/:userId/favoriteCollections', authenticate.verifyUser, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('favoriteCollection');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ favoriteCollections: user.favoriteCollection });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

module.exports = userRouter;
