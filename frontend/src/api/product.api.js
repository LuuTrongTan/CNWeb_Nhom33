import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/products`;

const productApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
productApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllProducts = async (params = {}) => {
  try {
    const response = await productApi.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy danh sách sản phẩm' };
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await productApi.get(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy thông tin sản phẩm' };
  }
};

export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await productApi.get(`/category/${categoryId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy sản phẩm theo danh mục' };
  }
};

export const searchProducts = async (query, params = {}) => {
  try {
    const response = await productApi.get('/search', { 
      params: { ...params, q: query }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi tìm kiếm sản phẩm' };
  }
};

export const getFeaturedProducts = async () => {
  try {
    const response = await productApi.get('/featured');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy sản phẩm nổi bật' };
  }
};

export const getNewProducts = async () => {
  try {
    const response = await productApi.get('/new');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy sản phẩm mới' };
  }
};

export const getBestSellingProducts = async () => {
  try {
    const response = await productApi.get('/best-selling');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy sản phẩm bán chạy' };
  }
};

export const getRelatedProducts = async (productId) => {
  try {
    const response = await productApi.get(`/${productId}/related`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy sản phẩm liên quan' };
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await productApi.get(`/${productId}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy đánh giá sản phẩm' };
  }
};

export const addProductReview = async (productId, reviewData) => {
  try {
    const response = await productApi.post(`/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi thêm đánh giá sản phẩm' };
  }
};

export const updateProductReview = async (productId, reviewId, reviewData) => {
  try {
    const response = await productApi.put(`/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi cập nhật đánh giá sản phẩm' };
  }
};

export const deleteProductReview = async (productId, reviewId) => {
  try {
    const response = await productApi.delete(`/${productId}/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi xóa đánh giá sản phẩm' };
  }
};

export default {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewProducts,
  getBestSellingProducts,
  getRelatedProducts,
  getProductReviews,
  addProductReview,
  updateProductReview,
  deleteProductReview,
}; 