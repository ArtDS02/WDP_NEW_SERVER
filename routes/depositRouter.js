const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Deposit = require('../models/deposit');
const User = require('../models/user');
const authenticate = require('../authen/authenticate');

// Tạo mới Deposit
router.post('/', authenticate.verifyUser, async (req, res) => {
  try {
    const { userId, number, content } = req.body;

    if (!userId || !number || number <= 0) {
      return res.status(400).json({ error: 'Valid userId and deposit amount are required' });
    }

    const newDeposit = new Deposit({
      userId: userId,
      number: number,
      content: content,
      status: 'pending'
    });

    await newDeposit.save();

    res.status(201).json({ message: 'Deposit created successfully', deposit: newDeposit });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// Lấy tất cả Deposits
router.get('/', authenticate.verifyUser, async (req, res) => {
  try {
    const deposits = await Deposit.find({});
    res.status(200).json({ deposits: deposits });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// Cập nhật trạng thái của Deposit
router.put('/:depositId', authenticate.verifyUser, async (req, res) => {
  try {
    const depositId = req.params.depositId;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    let deposit = await Deposit.findById(depositId);

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    deposit.status = status;

    if (status === 'complete') {
      const user = await User.findById(deposit.userId);

      if (user) {
        user.wallet += deposit.number;
        await user.save();
      }
    }

    await deposit.save();

    res.status(200).json({ message: 'Deposit updated successfully', deposit: deposit });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// Xóa Deposit
router.delete('/:depositId', authenticate.verifyUser, async (req, res) => {
  try {
    const depositId = req.params.depositId;

    const deposit = await Deposit.findByIdAndDelete(depositId);

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    res.status(200).json({ message: 'Deposit deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

// Lấy tất cả Deposits có status = "complete" và tính tổng đã nhận
router.get('/complete', authenticate.verifyUser, async (req, res) => {
  try {
    const deposits = await Deposit.find({status: "complete"});
    let total = 0;
    deposits.map(deposit => total += deposit.number);
    res.status(200).json({ deposits: deposits, total: total });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error.message });
  }
});

module.exports = router;
