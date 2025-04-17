import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faBell, faSignOutAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../../styles/css/Auth/Settings.css';

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newProducts: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userInfo = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (!userInfo || !token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/v1/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data);
        
        // Lấy cài đặt thông báo nếu có API
        try {
          const notificationsResponse = await axios.get('/v1/users/notifications', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setNotificationSettings(notificationsResponse.data);
        } catch (err) {
          // Nếu không có API hoặc lỗi, giữ nguyên giá trị mặc định
          console.log('Không thể tải cài đặt thông báo, sử dụng giá trị mặc định');
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validatePasswordForm = () => {
    // Kiểm tra mật khẩu hiện tại
    if (!passwordForm.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }

    // Kiểm tra mật khẩu mới
    if (passwordForm.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validatePasswordForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.post('/v1/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Hiển thị thông báo thành công
      setSuccessMessage('Mật khẩu đã được thay đổi thành công!');
    } catch (err) {
      console.error('Lỗi khi thay đổi mật khẩu:', err);
      setError(err.response?.data?.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.patch('/v1/users/notifications', notificationSettings, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Hiển thị thông báo thành công
      setSuccessMessage('Cài đặt thông báo đã được cập nhật!');
    } catch (err) {
      console.error('Lỗi khi cập nhật cài đặt thông báo:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật cài đặt thông báo. Vui lòng thử lại sau.');
    }
  };

  const handleLogout = () => {
    // Xóa thông tin đăng nhập trong localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Chuyển hướng đến trang đăng nhập
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      try {
        const token = localStorage.getItem('accessToken');
        
        await axios.delete('/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Xóa thông tin đăng nhập trong localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Hiển thị thông báo và chuyển hướng
        alert('Tài khoản của bạn đã được xóa thành công.');
        navigate('/');
      } catch (err) {
        console.error('Lỗi khi xóa tài khoản:', err);
        setError(err.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.');
      }
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="settings-error">
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Quay lại đăng nhập</button>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Cài đặt tài khoản</h1>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FontAwesomeIcon icon={faLock} /> Đổi mật khẩu
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FontAwesomeIcon icon={faBell} /> Thông báo
          </button>
          <button 
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Tài khoản
          </button>
        </div>

        <div className="settings-main">
          {successMessage && (
            <div className="settings-success-message">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="settings-error-message">
              {error}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Đổi mật khẩu</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <small className="form-text">Mật khẩu phải có ít nhất 8 ký tự</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="settings-submit-button">
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Cài đặt thông báo</h2>
              <form onSubmit={handleNotificationSubmit}>
                <div className="notification-option">
                  <label>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    Nhận thông báo qua email
                  </label>
                </div>

                <div className="notification-option">
                  <label>
                    <input
                      type="checkbox"
                      name="orderUpdates"
                      checked={notificationSettings.orderUpdates}
                      onChange={handleNotificationChange}
                    />
                    Cập nhật trạng thái đơn hàng
                  </label>
                </div>

                <div className="notification-option">
                  <label>
                    <input
                      type="checkbox"
                      name="promotions"
                      checked={notificationSettings.promotions}
                      onChange={handleNotificationChange}
                    />
                    Khuyến mãi và ưu đãi
                  </label>
                </div>

                <div className="notification-option">
                  <label>
                    <input
                      type="checkbox"
                      name="newProducts"
                      checked={notificationSettings.newProducts}
                      onChange={handleNotificationChange}
                    />
                    Thông báo sản phẩm mới
                  </label>
                </div>

                <button type="submit" className="settings-submit-button">
                  Lưu cài đặt
                </button>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Quản lý tài khoản</h2>
              
              <div className="account-options">
                <div className="account-option">
                  <h3>Đăng xuất</h3>
                  <p>Đăng xuất khỏi tài khoản của bạn trên thiết bị này.</p>
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
                  </button>
                </div>

                <div className="account-option danger-zone">
                  <h3>Xóa tài khoản</h3>
                  <p>Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.</p>
                  <button 
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 