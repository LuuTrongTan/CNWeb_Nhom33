import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/categories`;

const categoryApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
categoryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllCategories = async () => {
  try {
    const response = await categoryApi.get('/');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy danh sách danh mục' };
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await categoryApi.get(`/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi lấy thông tin danh mục' };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await categoryApi.post('/', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi tạo danh mục' };
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await categoryApi.put(`/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi cập nhật danh mục' };
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await categoryApi.delete(`/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi xóa danh mục' };
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}; 