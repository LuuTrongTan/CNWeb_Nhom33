import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/cart`;

const cartApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
cartApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCart = async () => {
  try {
    const response = await cartApi.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy giỏ hàng' };
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await cartApi.post('/', { productId, quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi thêm sản phẩm vào giỏ hàng' };
  }
};

export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await cartApi.put(`/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi cập nhật giỏ hàng' };
  }
};

export const removeFromCart = async (productId) => {
  try {
    const response = await cartApi.delete(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' };
  }
};

export const clearCart = async () => {
  try {
    const response = await cartApi.delete('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi xóa giỏ hàng' };
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
}; 