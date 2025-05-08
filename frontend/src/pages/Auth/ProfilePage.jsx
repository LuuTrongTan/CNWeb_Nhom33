import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faShoppingBag, faEdit, faCamera, faLock, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import AvatarModal from '../../components/AvatarModal';
import EmailVerificationModal from '../../components/EmailVerificationModal';
import '../../styles/css/Auth/Profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Kiểm tra token còn hợp lệ không
        try {
          const response = await axios.get('/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setUser(response.data);
          setFormData({
            name: response.data.name || '',
            phone: response.data.phone || '',
            address: response.data.address || ''
          });

          // Lấy danh sách đơn hàng của người dùng
          const ordersResponse = await axios.get('/orders', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setOrders(ordersResponse.data.results || []);
        } catch (err) {
          if (err.response?.status === 401) {
            // Token không hợp lệ, đăng xuất và chuyển hướng
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          throw err;
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch('/users/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Cập nhật thông tin trong localStorage
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Cập nhật state
      setUser(updatedUser);
      setEditMode(false);
      
      // Hiển thị thông báo thành công
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    const updatedUser = { ...user, avatar: newAvatarUrl };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-pending">Chờ xác nhận</span>;
      case 'processing':
        return <span className="status-processing">Đang xử lý</span>;
      case 'shipping':
        return <span className="status-shipping">Đang giao hàng</span>;
      case 'delivered':
        return <span className="status-delivered">Đã giao hàng</span>;
      case 'canceled':
        return <span className="status-canceled">Đã hủy</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const handleVerificationSuccess = () => {
    // Cập nhật trạng thái xác thực trong state và localStorage
    const updatedUser = { ...user, isEmailVerified: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleRequestVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/auth/request-email-verification', 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setIsVerificationModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác thực');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Quay lại đăng nhập</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Trang cá nhân</h1>
      </div>

      {user && user.authType === 'local' && !user.isEmailVerified && (
        <div className="verification-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>Tài khoản của bạn chưa được xác thực email.</span>
          <button onClick={handleRequestVerification}>
            Xác thực ngay
          </button>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button 
              className="avatar-edit-button"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              <FontAwesomeIcon icon={faCamera} />
            </button>
          </div>

          <div className="profile-info">
            <h2>{user.name}</h2>
            <p><FontAwesomeIcon icon={faEnvelope} /> {user.email}</p>
            {user.phone && <p><FontAwesomeIcon icon={faPhone} /> {user.phone}</p>}
            
            <div className="profile-actions">
              {!editMode ? (
                <button 
                  className="edit-profile-button"
                  onClick={() => setEditMode(true)}
                >
                  <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa thông tin
                </button>
              ) : (
                <button 
                  className="cancel-edit-button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    });
                    setError('');
                  }}
                >
                  Hủy chỉnh sửa
                </button>
              )}
              
              {user.authType === 'local' && (
                <Link to="/change-password" className="change-password-button">
                  <FontAwesomeIcon icon={faLock} /> Đổi mật khẩu
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="profile-main">
          {editMode ? (
            <div className="profile-edit">
              <h2>Chỉnh sửa thông tin</h2>
              
              {error && <div className="profile-error-message">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Họ tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                </div>
                
                <button type="submit" className="save-profile-button">
                  Lưu thay đổi
                </button>
              </form>
            </div>
          ) : (
            <div className="profile-details">
              <div className="profile-section">
                <h2>Thông tin chi tiết</h2>
                <div className="profile-detail-item">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">{user.address || 'Chưa cập nhật'}</span>
                </div>
              </div>
              
              <div className="profile-section">
                <h2><FontAwesomeIcon icon={faShoppingBag} /> Đơn hàng gần đây</h2>
                
                {orders.length === 0 ? (
                  <p className="no-orders">Bạn chưa có đơn hàng nào.</p>
                ) : (
                  <div className="orders-list">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-header">
                          <div className="order-id">Mã đơn hàng: #{order._id.substring(0, 8)}</div>
                          <div className="order-date">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="order-info">
                          <div className="order-details">
                            <span>Tổng tiền: {formatCurrency(order.totalAmount)}</span>
                            <span className="order-items-count">{order.items.length} sản phẩm</span>
                          </div>
                          <div className="order-status">
                            {getStatusLabel(order.status)}
                          </div>
                        </div>
                        <button 
                          className="view-order-button"
                          onClick={() => navigate(`/don-hang/${order._id}`)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    ))}
                    
                    {orders.length > 5 && (
                      <button 
                        className="view-all-orders-button"
                        onClick={() => navigate('/don-hang')}
                      >
                        Xem tất cả đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSuccess={handleAvatarUpdate}
      />

      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default ProfilePage; 