import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import TwoFactorAuth from './pages/auth/TwoFactorAuth';

// User pages
import Profile from './pages/user/Profile';
import OrderHistory from './pages/user/OrderHistory';
import OrderDetails from './pages/user/OrderDetails';
import Wishlist from './pages/user/Wishlist';
import SecuritySettings from './pages/user/SecuritySettings';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <div className="app">
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
          
          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/:orderId" 
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/security" 
            element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login page for now */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
