const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: 'Đơn hàng đã được lưu!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
