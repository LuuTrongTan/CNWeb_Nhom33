import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const { handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await handleGoogleLogin(credentialResponse.credential);
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập Google:', error);
    }
  };

  const handleGoogleError = () => {
    console.error('Đăng nhập Google thất bại');
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="filled_blue"
        shape="rectangular"
        text="signin_with"
        locale="vi"
      />
    </div>
  );
};

export default GoogleLoginButton;