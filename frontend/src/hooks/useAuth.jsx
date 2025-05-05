import { createContext, useState, useContext, useEffect } from 'react';
import { getUserProfile } from '../api/user.api';
import { loginWithGoogle, loginWithGithub } from '../api/auth.api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra đăng nhập khi khởi tạo
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getUserProfile();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Không thể lấy thông tin user:", error);
        // Chỉ xóa token và user khi gặp lỗi xác thực
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleGoogleLogin = async (googleToken) => {
    try {
      const data = await loginWithGoogle(googleToken);
      login(data.user, data.token);
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error.message);
      throw error;
    }
  };

  const handleGithubLogin = async (githubCode) => {
    try {
      const data = await loginWithGithub(githubCode);
      login(data.user, data.token);
    } catch (error) {
      console.error('Lỗi đăng nhập GitHub:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        handleGoogleLogin,
        handleGithubLogin,
        loading,
        isAuthenticated: !!user,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);