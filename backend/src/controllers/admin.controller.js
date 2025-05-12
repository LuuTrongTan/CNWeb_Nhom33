const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const ApiError = require('../utils/ApiError');
const { Order } = require('../models');

/**
 * Lấy tất cả đơn hàng (dành cho admin)
 */
const getAllOrders = catchAsync(async (req, res) => {
  // Chỉ admin mới có quyền xem tất cả đơn hàng
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xem tất cả đơn hàng');
  }
  
  const options = {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 10,
    sort: { createdAt: -1 }, // Sắp xếp theo thời gian tạo, mới nhất lên đầu
    populate: 'user', // Populate thông tin người dùng
  };
  
  // Tạo bộ lọc dựa trên query parameters
  const filter = {};
  
  // Lọc theo trạng thái nếu có
  if (req.query.status && req.query.status !== 'all') {
    filter.status = req.query.status;
  }
  
  // Lọc theo người dùng nếu có
  if (req.query.userId) {
    filter.user = req.query.userId;
  }
  
  // Lọc theo từ khóa tìm kiếm nếu có
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { orderNumber: searchRegex },
      { 'shippingAddress.fullName': searchRegex },
      { 'shippingAddress.phone': searchRegex }
    ];
  }
  
  const result = await orderService.queryOrders(filter, options);
  
  res.send({
    results: result.results,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.totalResults,
  });
});

/**
 * Xem chi tiết đơn hàng (dành cho admin)
 */
const getOrderDetails = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  res.send(order);
});

/**
 * Cập nhật đơn hàng (dành cho admin)
 */
const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, req.body);
  res.send(order);
});

/**
 * Lấy thống kê đơn hàng (dành cho admin)
 */
const getOrderStats = catchAsync(async (req, res) => {
  // Thống kê theo trạng thái
  const statusStats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  // Thống kê đơn hàng theo thời gian (7 ngày gần nhất)
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  
  const dailyStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: last7Days }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  res.send({
    statusStats,
    dailyStats
  });
});

module.exports = {
  getAllOrders,
  getOrderDetails,
  updateOrder,
  getOrderStats,
}; 