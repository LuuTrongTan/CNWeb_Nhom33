import React, { createContext, useState, useContext, useEffect } from 'react';
import authAPI from '../api/authAPI';

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
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.login(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
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
      await authAPI.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error("Đăng xuất lỗi:", err);
      // Vẫn xóa dữ liệu người dùng ở client ngay cả khi API lỗi
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

  // Các giá trị được chia sẻ qua context
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUserInfo,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 