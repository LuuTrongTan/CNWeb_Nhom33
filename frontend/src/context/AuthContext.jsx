import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import authAPI from '../api/authAPI';
import {
  loginUser,
  registerUser,
  verifyTwoFactor,
  getUserProfile
} from '../services/auth.service';

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
        if (token) {
          const user = await getUserProfile();
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
      // call whichever registration service you use
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
      // call whichever login service you use
      let resp;
      if (loginUser) {
        resp = await loginUser(credentials);
        if (resp.requireTwoFactor) {
          return { success: true, requireTwoFactor: true, userId: resp.userId };
        }
        const { token, user } = resp;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        const data = await authAPI.login(credentials.email, credentials.password);
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
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
