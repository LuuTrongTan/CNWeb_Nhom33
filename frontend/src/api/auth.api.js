import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await authApi.post('/google', { token: googleToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Lỗi khi đăng nhập bằng Google' };
  }
};

export default {
  loginWithGoogle,
};