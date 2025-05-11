import apiClient from './api.service';

// Get all user orders
export const getUserOrders = async () => {
  try {
    console.log('Đang gửi request lấy danh sách đơn hàng');
    // Kiểm tra token xác thực có tồn tại không
    const token = localStorage.getItem('token');
    console.log('Token xác thực:', token ? 'Có' : 'Không');
    
    const response = await apiClient.get('/orders');
    console.log('Kết quả lấy danh sách đơn hàng:', response);
    console.log('Ví dụ về trường createdAt của đơn hàng đầu tiên:', response[0]?.createdAt);
    
    // Nếu response không phải là mảng, trả về mảng rỗng
    if (!response || !Array.isArray(response)) {
      console.error('Dữ liệu không hợp lệ, response:', response);
      return [];
    }
    
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    throw error;
  }
};

// Get specific order details
export const getOrderDetails = async (orderId) => {
  try {
    console.log(`Đang gửi request lấy chi tiết đơn hàng: ${orderId}`);
    const response = await apiClient.get(`/orders/${orderId}`);
    console.log('Chi tiết đơn hàng nhận được:', response);
    console.log('Trường createdAt của đơn hàng:', response.createdAt);
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    throw error;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  // Tạo orderNumber trước khi gửi đến server
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Thêm orderNumber và đặt createdAt cố định tại thời điểm tạo đơn
  orderData.orderNumber = `DH${year}${month}${day}${random}`;
  
  // Đảm bảo thời gian tạo đơn hàng được thiết lập cố định và không thay đổi
  if (!orderData.createdAt) {
    orderData.createdAt = new Date().toISOString(); 
  }
  
  // Gọi API để tạo đơn hàng
  console.log('Đang tạo đơn hàng với dữ liệu:', orderData);
  const response = await apiClient.post('/orders', orderData);
  
  return response;
};

// Cancel order with authentication options
export const cancelOrder = async (orderId, cancelReason = '', orderNumber = null, phone = null) => {
  try {
    console.log(`Đang gửi request hủy đơn hàng đến ${'/orders/' + orderId + '/cancel'}`);
    
    // Chuẩn bị dữ liệu gửi đi
    const data = { cancelReason };
    
    // Thêm mã đơn hàng và số điện thoại nếu có (dùng khi không đăng nhập)
    if (orderNumber) data.orderNumber = orderNumber;
    if (phone) data.phone = phone;
    
    console.log('Data gửi đi:', data);
    
    // Kiểm tra token xác thực có tồn tại không
    const token = localStorage.getItem('token');
    console.log('Token xác thực:', token ? 'Có' : 'Không');
    
    const response = await apiClient.patch(`/orders/${orderId}/cancel`, data);
    console.log('Response từ server:', response);
    return response;
  } catch (error) {
    console.error('Lỗi trong hàm cancelOrder:', error);
    throw error;
  }
}; 