const Order = require('../models/order.model');
const { validationResult } = require('express-validator');

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('products.product');
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get specific order details
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('products.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error while fetching order details' });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const {
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;
    
    // Create new order
    const newOrder = new Order({
      user: userId,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });
    
    await newOrder.save();
    
    // Get the order with populated products
    const order = await Order.findById(newOrder._id).populate('products.product');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    
    // Find the order
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (order.orderStatus !== 'processing') {
      return res.status(400).json({
        message: 'Order cannot be cancelled at its current status'
      });
    }
    
    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
}; 