import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import authAPI from '../api/authAPI';
import {
  loginUser,
  registerUser,
  verifyTwoFactor,
  getUserProfile as serviceGetUserProfile
} from '../services/auth.service';
import {
  getUserProfile as apiGetUserProfile
} from '../api/user.api'; // ⚡ lấy từ user.api.js

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Error parsing user:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateUserInfo = (updatedFields) => {
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    try {
      const stored = localStorage.getItem('user');
      const base = stored && stored !== 'undefined' && stored !== 'null'
        ? JSON.parse(stored)
        : {};
      const merged = { ...base, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
    } catch {
      localStorage.setItem('user', JSON.stringify(updatedFields));
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      let resp;
      if (registerUser) {
        resp = await registerUser(userData);
        const { token, user } = resp;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        const data = await authAPI.register(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      }
      toast.success('Registration successful!');
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      let resp;
      if (loginUser) {
        resp = await loginUser(credentials);
        if (resp.requireTwoFactor) {
          return { success: true, requireTwoFactor: true, userId: resp.userId };
        }
        const { tokens, user } = resp;
        localStorage.setItem('token', tokens.access.token);
        localStorage.setItem('refreshToken', tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        const data = await authAPI.login(credentials.email, credentials.password);
        localStorage.setItem('token', data.tokens.access.token);
        localStorage.setItem('refreshToken', data.tokens.refresh.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      }
      toast.success('Login successful!');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      toast.error(msg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (userId, token2fa) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await verifyTwoFactor(userId, token2fa);
      const { token, user } = resp;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success('2FA verification successful!');
      return { success: true };
    } catch (err) {
      console.error('2FA error:', err);
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      setError(msg);
      toast.error(msg);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.info('You have been logged out');
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    verify2FA,
    logout,
    updateUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
