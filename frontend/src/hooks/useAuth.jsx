import { createContext, useState, useContext, useEffect } from 'react';
import { getUserProfile } from '../api/user.api';
import { loginWithGoogle } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi khi đọc user từ localStorage:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getUserProfile();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Cập nhật dữ liệu đúng
        } catch (error) {
          console.error("Không thể lấy thông tin user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // Lưu user khi đăng nhập
    setUser(userData); // Cập nhật trạng thái user
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // Cập nhật trạng thái user
  };

  const handleGoogleLogin = async (googleToken) => {
    try {
      const data = await loginWithGoogle(googleToken);
      login(data.user, data.token); // Sử dụng hàm login để đồng bộ
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error.message);
      throw error; // Ném lỗi để component gọi xử lý
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser, // Thêm updateUser để ProfilePage sử dụng
        handleGoogleLogin,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);