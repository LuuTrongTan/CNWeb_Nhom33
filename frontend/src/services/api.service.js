import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMessage = "Something went wrong";

    if (error.response) {
      // Server responded with a status code outside the 2xx range
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401 || status === 403) {
        // If token expired or invalid, clear local storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // Redirect to login page
        window.location.href = "/login";
      }

      errorMessage = data.message || `Error: ${status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server";
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Lưu thông báo lỗi vào localStorage nếu là lỗi đăng nhập
//     if (error.config.url.includes("/auth/login")) {
//       const errorMsg =
//         error.response?.status === 429
//           ? "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 5 phút."
//           : error.response?.data?.message ||
//             "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
//       localStorage.setItem("loginError", errorMsg);
//     }

//     // Handle authentication errors
//     if (error.response?.status === 401) {
//       // Redirect to login page
//       window.location.href = "/login";
//     }

//     return Promise.reject(error);
//   }
// );

export default apiClient;
