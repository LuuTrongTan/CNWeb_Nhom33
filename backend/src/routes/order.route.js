const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const orderValidation = require('../validations/order.validation');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// Tạo đơn hàng mới - không cần đăng nhập
router.post('/', orderController.createOrder);

// Lấy đơn hàng theo ID - không cần đăng nhập nếu có mã đơn hàng
router.get('/:orderId', orderController.getOrderById);

// Các route yêu cầu đăng nhập
router.use(auth());

// Lấy danh sách đơn hàng của người dùng
router.get('/', orderController.getOrders);

// Hủy đơn hàng
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Các route yêu cầu quyền admin
router.use(auth('admin'));

// Cập nhật trạng thái đơn hàng
router.patch('/:orderId', orderController.updateOrderStatus);

module.exports = router; 