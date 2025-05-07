const express = require('express');
const auth = require('../middlewares/auth');
const orderController = require('../controllers/order.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), orderController.createOrder)
  .get(auth(), orderController.getUserOrders);

router
  .route('/stats')
  .get(auth(), orderController.getOrderStats);

router
  .route('/:orderId')
  .get(auth(), orderController.getOrderById);

router
  .route('/:orderId/cancel')
  .patch(auth(), orderController.cancelOrder);

router
  .route('/:orderId/status')
  .patch(auth('admin'), orderController.updateOrderStatus);

module.exports = router; 