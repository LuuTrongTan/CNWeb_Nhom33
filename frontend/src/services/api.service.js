import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Lưu thông báo lỗi vào localStorage nếu là lỗi đăng nhập
    if (error.config.url.includes('/auth/login')) {
      const errorMsg = error.response?.status === 429
        ? 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 5 phút.'
        : error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      localStorage.setItem('loginError', errorMsg);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient; 