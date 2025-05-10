import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/css/Auth/ChangePassword.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Kiểm tra mật khẩu có chứa ít nhất 1 chữ cái và 1 số
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm cả chữ cái và số.');
      return;
    }

    try {
      await axios.post('/auth/change-password', formData);
      setSuccess('Đổi mật khẩu thành công!');
      // Xóa form sau khi đổi mật khẩu thành công
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    }
  };

  // Nếu người dùng không phải local, hiển thị thông báo
  if (currentUser?.authType !== 'local') {
    return (
      <div className="change-password-container">
        <div className="change-password-form">
          <div className="change-password-header">
            <h1>Đổi mật khẩu</h1>
            <p>Chức năng này chỉ khả dụng cho tài khoản đăng nhập bằng email và mật khẩu.</p>
          </div>
          <div className="back-to-profile">
            <button onClick={() => navigate('/profile')}>Quay lại trang cá nhân</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <div className="change-password-header">
          <h1>Đổi mật khẩu</h1>
          <p>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự, bao gồm cả chữ cái và số)"
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu mới"
              minLength="8"
            />
          </div>

          <button type="submit" className="submit-button">
            Đổi mật khẩu
          </button>
        </form>

        <div className="back-to-profile">
          <button onClick={() => navigate('/profile')}>Quay lại trang cá nhân</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage; 