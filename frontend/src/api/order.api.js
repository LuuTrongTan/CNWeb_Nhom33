import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

const orderApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
orderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createOrder = async (orderData) => {
  try {
    const response = await orderApi.post('/', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi tạo đơn hàng' };
  }
};

export const getOrders = async (params = {}) => {
  try {
    const response = await orderApi.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy danh sách đơn hàng' };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await orderApi.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy thông tin đơn hàng' };
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await orderApi.put(`/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi hủy đơn hàng' };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await orderApi.put(`/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi cập nhật trạng thái đơn hàng' };
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
}; 