const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Tạo đơn hàng mới
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  // Tính tổng tiền sản phẩm
  const totalItemsPrice = orderBody.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Tính tổng tiền đơn hàng
  const totalPrice = totalItemsPrice + 
    orderBody.shippingPrice + 
    orderBody.taxPrice - 
    (orderBody.discountPrice || 0);
  
  // Tạo đơn hàng với tổng tiền đã tính
  const orderData = {
    ...orderBody,
    totalItemsPrice,
    totalPrice,
  };
  
  return Order.create(orderData);
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
  return Order.findById(id).populate('items.product');
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
  await order.save();
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
  updateOrderById,
  getUserOrderStats,
}; 