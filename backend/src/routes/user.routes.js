const express = require('express');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Lấy thông tin địa chỉ giao hàng của người dùng
router.get('/shipping-info', auth(), userController.getShippingInfo);

module.exports = router; 