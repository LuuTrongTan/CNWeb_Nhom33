import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback = () => {
  const { handleOAuthCallback } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    // Handle the OAuth callback
    handleOAuthCallback(token);
  }, [location, handleOAuthCallback]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="loading"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback; 