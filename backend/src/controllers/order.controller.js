const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Tạo đơn hàng mới
 */
const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder({
    ...req.body,
    user: req.user.id,
  });
  res.status(httpStatus.CREATED).send(order);
});

/**
 * Lấy danh sách đơn hàng của người dùng đăng nhập
 */
const getUserOrders = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    populate: 'items.product',
  };
  
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

/**
 * Lấy chi tiết đơn hàng theo ID
 */
const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  // Kiểm tra quyền truy cập, chỉ cho phép xem đơn hàng của chính mình
  // hoặc admin/staff có quyền xem tất cả
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xem đơn hàng này');
  }
  
  res.send(order);
});

/**
 * Hủy đơn hàng
 */
const cancelOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  // Chỉ cho phép người dùng hủy đơn hàng của chính mình
  if (order.user.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền hủy đơn hàng này');
  }
  
  // Chỉ cho phép hủy đơn hàng khi trạng thái là "pending" hoặc "processing"
  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      'Không thể hủy đơn hàng khi đã được vận chuyển hoặc giao hàng'
    );
  }
  
  const updatedOrder = await orderService.updateOrderById(
    req.params.orderId, 
    { status: 'cancelled', cancelledAt: new Date() }
  );
  
  res.send(updatedOrder);
});

/**
 * Lấy số liệu thống kê đơn hàng của người dùng
 */
const getOrderStats = catchAsync(async (req, res) => {
  const stats = await orderService.getUserOrderStats(req.user.id);
  res.send(stats);
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getOrderStats,
}; 