import apiClient from '../services/api.service';

// Auth APIs
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Profile APIs
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token for getUserProfile:', token);
    const response = await apiClient.get('/users/profile');
    return response;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error.response?.data || error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token for updateProfile:', token);
    console.log('Sending update profile request:', userData);
    
    const response = await apiClient.patch('/users/profile', userData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Update profile response:', response);
    return response.data;
  } catch (error) {
    console.error('Update profile error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error.response?.data || { message: 'Lỗi không xác định khi cập nhật profile' };
  }
};

export const updateProfileWithFormData = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token for updateProfileWithFormData:', token);
    console.log('Sending update profile request with FormData:', userData);
    
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key]) {
        formData.append(key, userData[key]);
      }
    });
    
    const response = await apiClient.patch('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Update profile response:', response);
    return response;
  } catch (error) {
    console.error('Update profile error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw error.response?.data || { message: 'Lỗi không xác định khi cập nhật profile' };
  }
};

// Address APIs
export const addAddress = async (addressData) => {
  try {
    const response = await apiClient.post('/users/addresses', addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await apiClient.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`/users/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getWishlist = async () => {
  try {
    const response = await apiClient.get('/users/wishlist');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await apiClient.post('/users/wishlist', { productId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await apiClient.delete(`/users/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Password API
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi không xác định' };
  }
};

export const getOrderHistory = async () => {
  try {
    const response = await apiClient.get('/users/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  register,
  login,
  getUserProfile,
  updateProfile,
  updateProfileWithFormData,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  changePassword,
  getOrderHistory,
  uploadAvatar,
};