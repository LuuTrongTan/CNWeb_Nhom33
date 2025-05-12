const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Tạo đơn hàng mới
 */
const createOrder = catchAsync(async (req, res) => {
  // Lấy thông tin người dùng nếu đã đăng nhập
  const userId = req.user ? req.user.id : null;
  
  // Tạo dữ liệu đơn hàng
  const orderData = {
    ...req.body,
    user: userId,
  };
  
  // Đảm bảo createdAt là giá trị cố định và không thay đổi
  if (!orderData.createdAt) {
    orderData.createdAt = new Date().toISOString();
  }
  
  // Tính tổng tiền đơn hàng
  orderData.totalAmount = orderData.totalItemsPrice + orderData.shippingPrice;
  
  // Gọi service để tạo đơn hàng
  const order = await orderService.createOrder(orderData);
  
  // Trả về toàn bộ thông tin đơn hàng đã tạo
  res.status(httpStatus.CREATED).send(order);
});

/**
 * Lấy danh sách đơn hàng của người dùng đăng nhập
 */
const getOrders = catchAsync(async (req, res) => {
  // Lấy danh sách đơn hàng của người dùng hiện tại
  const userId = req.user.id;
  const orders = await orderService.getOrdersByUser(userId);
  res.send(orders);
});

/**
 * Lấy chi tiết đơn hàng theo ID
 */
const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  // Kiểm tra quyền truy cập
  if (req.user && order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xem đơn hàng này');
  }
  
  res.send(order);
});

/**
 * Hủy đơn hàng
 */
const cancelOrder = catchAsync(async (req, res) => {
  try {
    console.log('Nhận yêu cầu hủy đơn hàng:', req.params.orderId);
    console.log('User ID:', req.user ? req.user.id : 'Không có user');
    console.log('Request body:', req.body);
    
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đơn hàng');
  }
  
  // Kiểm tra quyền hủy đơn hàng
    // Cho phép hủy đơn khi:
    // 1. Người dùng đã đăng nhập và là chủ đơn hàng
    // 2. Người dùng là admin
    // 3. Người dùng biết mã đơn hàng và số điện thoại đặt hàng
    const isAuthorized = 
      (req.user && req.user.id === order.user?.toString()) || 
      (req.user && req.user.role === 'admin') ||
      (req.body.orderNumber === order.orderNumber && 
       req.body.phone === order.shippingAddress.phone);
    
    if (!isAuthorized) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền hủy đơn hàng này');
  }
  
  // Kiểm tra trạng thái đơn hàng
  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không thể hủy đơn hàng ở trạng thái này');
  }
  
    // Lấy lý do hủy đơn hàng từ request body (nếu có)
    const updateData = { 
      status: 'cancelled',
      cancelReason: req.body.cancelReason || 'Hủy bởi khách hàng',
      cancelledAt: new Date()
    };
    
    console.log('Cập nhật đơn hàng với dữ liệu:', updateData);
    
    const updatedOrder = await orderService.updateOrderById(req.params.orderId, updateData);
    console.log('Đơn hàng đã được cập nhật thành công');
    
  res.send(updatedOrder);
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    throw error;
  }
});

/**
 * Cập nhật trạng thái đơn hàng
 */
const updateOrderStatus = catchAsync(async (req, res) => {
  // Chỉ admin mới có quyền cập nhật trạng thái đơn hàng
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền cập nhật đơn hàng');
  }
  
  const order = await orderService.updateOrderById(req.params.orderId, req.body);
  res.send(order);
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
  getOrders,
  getOrderById,
  cancelOrder,
  getOrderStats,
  updateOrderStatus,
}; 