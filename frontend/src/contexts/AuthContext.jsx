import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser, registerUser, verifyTwoFactor, getUserProfile } from '../services/auth.service';

// Create auth context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // On mount, check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Fetch user profile
        const user = await getUserProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await registerUser(userData);
      
      // Save token and set user
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      navigate('/profile');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message || 'Registration failed');
      toast.error(error.message || 'Registration failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(credentials);
      
      // Check if 2FA is required
      if (response.requireTwoFactor) {
        return { 
          success: true, 
          requireTwoFactor: true, 
          userId: response.userId 
        };
      }
      
      // Save token and set user
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      navigate('/profile');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      toast.error(error.message || 'Login failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA token
  const verify2FA = async (userId, token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await verifyTwoFactor(userId, token);
      
      // Save token and set user
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Authentication successful!');
      navigate('/profile');
      return { success: true };
    } catch (error) {
      console.error('2FA verification error:', error);
      setError(error.message || 'Verification failed');
      toast.error(error.message || 'Verification failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
    navigate('/login');
  };

  // Handle OAuth callback
  const handleOAuthCallback = (token) => {
    try {
      if (!token) {
        throw new Error('Authentication failed');
      }
      
      localStorage.setItem('token', token);
      
      // We'll need to fetch the user profile since we don't have it
      getUserProfile()
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          toast.success('Authentication successful!');
          navigate('/profile');
        })
        .catch(error => {
          console.error('Error fetching user after OAuth:', error);
          localStorage.removeItem('token');
          toast.error('Failed to get user information');
          navigate('/login');
        });
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast.error(error.message || 'Authentication failed');
      navigate('/login');
    }
  };

  // Auth context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    verify2FA,
    logout,
    handleOAuthCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 