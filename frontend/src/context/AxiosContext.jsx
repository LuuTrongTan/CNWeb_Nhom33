import React, { createContext, useEffect } from 'react';
import axios from 'axios';

// Tạo context
export const AxiosContext = createContext();

export const AxiosProvider = ({ children }) => {
  useEffect(() => {
    // Cấu hình axios
    axios.defaults.baseURL = 'http://localhost:4000';
    
    // Thêm interceptor cho request
    axios.interceptors.request.use(
      (config) => {
        // Lấy token từ localStorage nếu có
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Thêm interceptor cho response
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Xử lý lỗi phản hồi
        if (error.response) {
          // Xử lý lỗi 401 (Unauthorized)
          if (error.response.status === 401) {
            // Đăng xuất người dùng, xóa token
            localStorage.removeItem('token');
            // Có thể thêm redirect đến trang đăng nhập ở đây
            window.location.href = '/login';
          }
          
          // Xử lý lỗi 403 (Forbidden)
          if (error.response.status === 403) {
            console.error('Bạn không có quyền truy cập tài nguyên này');
          }
          
          // Xử lý lỗi 404 (Not Found)
          if (error.response.status === 404) {
            console.error('Tài nguyên không tồn tại');
          }
          
          // Xử lý lỗi 500 (Server Error)
          if (error.response.status >= 500) {
            console.error('Đã xảy ra lỗi máy chủ');
          }
        } else if (error.request) {
          // Không nhận được phản hồi từ server
          console.error('Không thể kết nối đến máy chủ');
        } else {
          // Lỗi trong quá trình thiết lập request
          console.error('Lỗi:', error.message);
        }
        
        return Promise.reject(error);
      }
    );

  }, []);

  return (
    <AxiosContext.Provider value={{}}>
      {children}
    </AxiosContext.Provider>
  );
}; 