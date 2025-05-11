const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu quyền admin
router.use(auth('manageOrders'));

// Routes quản lý đơn hàng
router.get('/orders', adminController.getAllOrders);
router.get('/orders/stats', adminController.getOrderStats);
router.get('/orders/:orderId', adminController.getOrderDetails);
router.patch('/orders/:orderId', adminController.updateOrder);

module.exports = router; 