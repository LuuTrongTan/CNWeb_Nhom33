import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/css/Auth/ForgotPassword.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getErrorMessage = (error) => {
    if (error.response?.data?.error?.errors?.password) {
      return error.response.data.error.errors.password.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/auth/forgot-password', { email });
      setSuccess('Mã xác thực đã được gửi vào email của bạn.');
      setStep(2);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/auth/verify-reset-code', { email, code });
      setSuccess('Xác thực thành công!');
      setStep(3);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Kiểm tra mật khẩu có chứa ít nhất 1 chữ cái và 1 số
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm cả chữ cái và số.');
      return;
    }

    try {
      await axios.post('/auth/reset-password', {
        email,
        code,
        newPassword,
        confirmPassword
      });
      setSuccess('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            <button type="submit" className="submit-button">
              Gửi mã xác thực
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label htmlFor="code">Mã xác thực</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="Nhập mã xác thực"
              />
            </div>
            <button type="submit" className="submit-button">
              Xác thực
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, bao gồm cả chữ cái và số)"
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Nhập lại mật khẩu mới"
                minLength="8"
              />
            </div>
            <button type="submit" className="submit-button">
              Đặt lại mật khẩu
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="forgot-password-header">
          <h1>Quên mật khẩu</h1>
          <p>Vui lòng làm theo các bước để đặt lại mật khẩu của bạn</p>
        </div>

        <div className="steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Nhập email</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Xác thực</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Đặt mật khẩu</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {renderStep()}

        <div className="back-to-login">
          <a href="/login">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 