const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticateJWT);

// Get user's orders
router.get('/', orderController.getUserOrders);

// Get specific order details
router.get('/:orderId', orderController.getOrderDetails);

// Create new order
router.post(
  '/',
  [
    check('products', 'Products are required').isArray({ min: 1 }),
    check('products.*.product', 'Product ID is required').not().isEmpty(),
    check('products.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
    check('products.*.price', 'Price is required').isNumeric(),
    check('totalAmount', 'Total amount is required').isNumeric(),
    check('shippingAddress', 'Shipping address is required').not().isEmpty(),
    check('shippingAddress.street', 'Street is required').not().isEmpty(),
    check('shippingAddress.city', 'City is required').not().isEmpty(),
    check('shippingAddress.state', 'State is required').not().isEmpty(),
    check('shippingAddress.zipCode', 'Zip code is required').not().isEmpty(),
    check('shippingAddress.country', 'Country is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty()
  ],
  orderController.createOrder
);

// Cancel order
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router; 