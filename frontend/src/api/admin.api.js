import axios from 'axios';

const adminApi = axios.create({
    baseURL: 'http://localhost:5000/api/admin',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để tự động thêm token vào header
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Quản lý người dùng
export const getUsers = async () => {
    try {
        const response = await adminApi.get('/users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách người dùng');
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await adminApi.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
};

// Quản lý sản phẩm
export const getProducts = async () => {
    try {
        const response = await adminApi.get('/products');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy danh sách sản phẩm');
    }
};

export const getProduct = async (productId) => {
    try {
        const response = await adminApi.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể lấy thông tin sản phẩm');
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await adminApi.post('/products', productData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể tạo sản phẩm');
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await adminApi.put(`/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể cập nhật sản phẩm');
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await adminApi.delete(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
}; 