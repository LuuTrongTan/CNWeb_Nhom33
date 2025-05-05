import apiClient from './api.service';

// Register new user
export const registerUser = async (userData) => {
  return await apiClient.post('/auth/register', userData);
};

// Login user
export const loginUser = async (credentials) => {
  return await apiClient.post('/auth/login', credentials);
};

// Google login
export const googleLogin = async (token) => {
  return await apiClient.post('/auth/google-login', { token });
};

// Verify two-factor authentication
export const verifyTwoFactor = async (userId, token) => {
  return await apiClient.post('/auth/verify-2fa', { userId, token });
};

// Get user profile
export const getUserProfile = async () => {
  return await apiClient.get('/users/profile');
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  return await apiClient.put('/users/profile', profileData);
};

// Update user password
export const updatePassword = async (passwordData) => {
  return await apiClient.put('/users/password', passwordData);
};

// Setup two-factor authentication
export const setupTwoFactor = async () => {
  return await apiClient.get('/auth/setup-2fa');
};

// Enable two-factor authentication
export const enableTwoFactor = async (token) => {
  return await apiClient.post('/auth/enable-2fa', { token });
};

// Disable two-factor authentication
export const disableTwoFactor = async () => {
  return await apiClient.post('/auth/disable-2fa');
}; 