import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-tokens`, {
            refreshToken
          });

          if (response.data.tokens) {
            localStorage.setItem('token', response.data.tokens.access.token);
            localStorage.setItem('refreshToken', response.data.tokens.refresh.token);
            
            // Retry original request with new token
            originalRequest.headers['Authorization'] = `Bearer ${response.data.tokens.access.token}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh token fails, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    let errorMessage = 'Something went wrong';
    
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // If token expired or invalid, clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      errorMessage = data.message || `Error: ${status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient; 