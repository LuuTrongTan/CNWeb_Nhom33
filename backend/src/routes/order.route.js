const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const orderValidation = require('../validations/order.validation');
const orderController = require('../controllers/order.controller');
const passport = require('passport');

const router = express.Router();

// Middleware cho phép xác thực không bắt buộc
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Tạo đơn hàng mới - cho phép xác thực không bắt buộc để lấy thông tin người dùng nếu đã đăng nhập
router.post('/', optionalAuth, orderController.createOrder);

// Lấy đơn hàng theo ID - không cần đăng nhập nếu có mã đơn hàng
router.get('/:orderId', orderController.getOrderById);

// Hủy đơn hàng - có thể hủy mà không cần đăng nhập nếu biết mã đơn hàng và số điện thoại
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Các route yêu cầu đăng nhập
router.use(auth());

// Lấy danh sách đơn hàng của người dùng
router.get('/', orderController.getOrders);

// Các route yêu cầu quyền admin
router.use(auth('admin'));

// Cập nhật trạng thái đơn hàng
router.patch('/:orderId', orderController.updateOrderStatus);

module.exports = router; 