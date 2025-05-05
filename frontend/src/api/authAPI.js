import axios from 'axios';

const authAPI = {
  // Đăng ký tài khoản mới
  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data && response.data.tokens && response.data.user) {
        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem('token', response.data.tokens.access.token);
        localStorage.setItem('refreshToken', response.data.tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data && response.data.tokens && response.data.user) {
        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem('token', response.data.tokens.access.token);
        localStorage.setItem('refreshToken', response.data.tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          await axios.post('/auth/logout', { refreshToken });
        } catch (error) {
          console.error("Lỗi khi gọi API đăng xuất:", error);
          // Không throw error ở đây vì chúng ta vẫn muốn xóa dữ liệu local
        }
      }
      
      // Xóa thông tin người dùng khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return true;
    } catch (error) {
      // Đảm bảo xóa dữ liệu local ngay cả khi có lỗi khác
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return true; // Trả về true vì chúng ta đã xóa dữ liệu local thành công
    }
  },

  // Lấy thông tin người dùng hiện tại từ localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Lỗi parse thông tin người dùng:", error);
      localStorage.removeItem('user');
      return null;
    }
  },

  // Kiểm tra người dùng đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Làm mới token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }
      
      const response = await axios.post('/auth/refresh-tokens', { refreshToken });
      
      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access.token);
        localStorage.setItem('refreshToken', response.data.refresh.token);
      }
      
      return response.data;
    } catch (error) {
      // Nếu refresh token fails, đăng xuất
      authAPI.logout();
      throw error;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      await axios.post('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      await axios.post(`/auth/reset-password?token=${token}`, { 
        password: newPassword 
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default authAPI; 