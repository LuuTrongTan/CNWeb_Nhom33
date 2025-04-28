import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faShoppingBag, faEdit, faCamera } from '@fortawesome/free-solid-svg-icons';
import { updateProfile } from '../../api/user.api';
import '../../styles/css/Auth/Profile.css';

const ProfilePage = () => {
  const { currentUser, updateUserInfo, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        avatar: null
      });
      // TODO: Lấy danh sách đơn hàng từ API
      // fetchOrders();
    }
  }, [currentUser, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước ảnh đại diện không được vượt quá 2MB.');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh.');
      return;
    }

    setFormData({ ...formData, avatar: file });
    
    // Hiển thị ảnh xem trước
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API cập nhật thông tin người dùng
      const response = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      
      // Cập nhật thông tin trong AuthContext và localStorage
      updateUserInfo({
        name: response.name,
        phone: response.phone,
        address: response.address,
      });

      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
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

  if (authLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }
  if (!currentUser) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Trang cá nhân</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            {editMode ? (
              <div className="avatar-upload">
                {avatarPreview || currentUser.avatar ? (
                  <img src={avatarPreview || currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label htmlFor="avatar-input" className="avatar-edit-button">
                  <FontAwesomeIcon icon={faCamera} />
                </label>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="profile-info">
            <h2>{currentUser.name}</h2>
            <p><FontAwesomeIcon icon={faEnvelope} /> {currentUser.email}</p>
            {currentUser.phone && <p><FontAwesomeIcon icon={faPhone} /> {currentUser.phone}</p>}
            
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
                    name: currentUser.name || '',
                    phone: currentUser.phone || '',
                    address: currentUser.address || '',
                    avatar: null
                  });
                  setAvatarPreview('');
                  setError('');
                }}
              >
                Hủy chỉnh sửa
              </button>
            )}
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
                
                <button type="submit" className="save-profile-button" disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          ) : (
            <div className="profile-details">
              <div className="profile-section">
                <h2>Thông tin chi tiết</h2>
                <div className="profile-detail-item">
                  <span className="detail-label">Địa chỉ:</span>
                  <span className="detail-value">{currentUser.address || 'Chưa cập nhật'}</span>
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
    </div>
  );
};

export default ProfilePage; 