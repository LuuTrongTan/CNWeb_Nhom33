const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Tạo đơn hàng mới
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  const order = await Order.create(orderBody);
  // Truy vấn lại để lấy đầy đủ dữ liệu sau khi đã tạo
  const populatedOrder = await Order.findById(order._id);
  return populatedOrder;
};

/**
 * Truy vấn danh sách đơn hàng
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
  const orders = await Order.paginate(filter, options);
  return orders;
};

/**
 * Lấy đơn hàng theo ID
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id) => {
  return Order.findById(id);
};

/**
 * Lấy danh sách đơn hàng của người dùng
 * @param {ObjectId} userId
 * @returns {Promise<Order[]>}
 */
const getOrdersByUser = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * Cập nhật đơn hàng theo ID
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  Object.assign(order, updateBody);
  
  // Xử lý các trường hợp đặc biệt
  if (updateBody.status === 'delivered' && !order.isDelivered) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  
  if (updateBody.status === 'cancelled' && !order.cancelledAt) {
    order.cancelledAt = new Date();
  }
  
  await order.save();
  return order;
};

/**
 * Xóa đơn hàng theo ID
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const deleteOrderById = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  await order.remove();
  return order;
};

/**
 * Lấy thống kê đơn hàng của user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getUserOrderStats = async (userId) => {
  const stats = {
    total: 0,
    completed: 0,
    cancelled: 0,
    processing: 0,
    totalSpent: 0
  };
  
  // Tính tổng số đơn hàng
  stats.total = await Order.countDocuments({ user: userId });
  
  // Tính số đơn hàng đã hoàn thành
  stats.completed = await Order.countDocuments({ 
    user: userId, 
    status: 'delivered' 
  });
  
  // Tính số đơn hàng đã hủy
  stats.cancelled = await Order.countDocuments({ 
    user: userId, 
    status: 'cancelled' 
  });
  
  // Tính số đơn hàng đang xử lý
  stats.processing = await Order.countDocuments({
    user: userId,
    status: { $in: ['pending', 'processing', 'shipped'] }
  });
  
  // Tính tổng tiền đã chi
  const totalSpentResult = await Order.aggregate([
    {
      $match: { 
        user: userId,
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' }
      }
    }
  ]);
  
  if (totalSpentResult.length > 0) {
    stats.totalSpent = totalSpentResult[0].total;
  }
  
  return stats;
};

module.exports = {
  createOrder,
  queryOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderById,
  deleteOrderById,
  getUserOrderStats,
}; 