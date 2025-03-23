const Order = require("../models/Order");
const { calculateShippingFee } = require("../utils/shipping");
const { createTrackingOrder } = require("../utils/shippingProviders");
const { broadcastOrderUpdate } = require("../utils/websocket");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, discount, notes } = req.body;

    // Tính toán phí vận chuyển
    const shippingFee = await calculateShippingFee(shippingAddress);

    // Tính tổng tiền
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      shippingFee,
      totalAmount,
      discount,
      notes,
    });

    await order.save();

    // Tạo mã vận đơn từ đơn vị vận chuyển
    const trackingInfo = await createTrackingOrder(order);
    order.trackingNumber = trackingInfo.trackingNumber;
    order.shippingProvider = trackingInfo.provider;
    await order.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, shippingStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Cập nhật trạng thái
    if (orderStatus) {
      order.orderStatus = orderStatus;
      // Gửi thông báo WebSocket
      broadcastOrderUpdate(orderId, orderStatus);
    }
    if (shippingStatus) order.shippingStatus = shippingStatus;

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Xử lý yêu cầu đổi/trả hàng
exports.handleReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Kiểm tra điều kiện đổi/trả hàng
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        error: "Order must be delivered before requesting return",
      });
    }

    // Tạo yêu cầu đổi/trả hàng
    order.returnRequest = {
      status: "pending",
      reason,
      createdAt: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Cập nhật trạng thái yêu cầu đổi/trả hàng
exports.updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (!order.returnRequest) {
      return res.status(400).json({
        success: false,
        error: "No return request found for this order",
      });
    }

    order.returnRequest.status = status;
    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy thông tin đơn hàng
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
