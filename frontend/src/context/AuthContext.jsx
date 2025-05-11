import React, { createContext, useState, useContext, useEffect } from 'react';
import authAPI from '../api/authAPI';
import { googleLogin } from '../services/auth.service';

// Khởi tạo context
const AuthContext = createContext();

// Custom hook để sử dụng context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra token và lấy thông tin người dùng khi khởi tạo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
          } catch (e) {
            console.error("Lỗi parse user JSON:", e);
            // Xóa user không hợp lệ
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error("Khởi tạo auth lỗi:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    console.log("context: Đăng nhập với email:", email);
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      // Xử lý lỗi rate limit
      if (err.response?.status === 429) {
        setError('Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 5 phút.');
      } else {
        setError(err.response?.data?.message || "Đăng nhập thất bại");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.register(userData);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = async () => {
    setLoading(true);
    
    try {
      // Xóa dữ liệu local trước khi gọi API
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
      
      // Gọi API đăng xuất sau khi đã xóa dữ liệu local
      try {
        await authAPI.logout();
      } catch (err) {
        console.error("Lỗi khi gọi API đăng xuất:", err);
        // Không cần xử lý gì thêm vì đã xóa dữ liệu local
      }
      
      // Chuyển hướng về trang chủ
      window.location.href = '/';
    } catch (err) {
      console.error("Đăng xuất lỗi:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin người dùng
  const updateUserInfo = (updatedUser) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUser
    }));
    
    // Cập nhật trong localStorage
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          ...updatedUser
        }));
      } catch (e) {
        console.error("Lỗi parse user JSON khi cập nhật:", e);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } else {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await googleLogin(token);
      const { user, tokens } = response.data;
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', tokens.access.token);
      localStorage.setItem('refreshToken', tokens.refresh.token);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập Google thất bại");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Các giá trị được chia sẻ qua context
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserInfo,
    loginWithGoogle,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 