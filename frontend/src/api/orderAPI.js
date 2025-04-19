import axios from 'axios';
import { API_URL } from '../config/constants';

const orderAPI = {
  // Lấy tất cả đơn hàng của người dùng hiện tại
  getOrdersByUser: async () => {
    const token = localStorage.getItem('token');
    return await axios.get(`${API_URL}/orders/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (orderId) => {
    const token = localStorage.getItem('token');
    return await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    const token = localStorage.getItem('token');
    return await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    const token = localStorage.getItem('token');
    return await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Xác nhận đã nhận hàng
  confirmDelivery: async (orderId) => {
    const token = localStorage.getItem('token');
    return await axios.put(`${API_URL}/orders/${orderId}/confirm-delivery`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Đánh giá đơn hàng sau khi đã nhận được hàng
  reviewOrder: async (orderId, reviewData) => {
    const token = localStorage.getItem('token');
    return await axios.post(`${API_URL}/orders/${orderId}/review`, reviewData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default orderAPI; 