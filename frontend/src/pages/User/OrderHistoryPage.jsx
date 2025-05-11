import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faShoppingBag, 
  faSearch, 
  faFilter, 
  faSort, 
  faCheck, 
  faClock, 
  faTruck, 
  faXmark,
  faExclamationTriangle,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { getUserOrders } from '../../services/order.service';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import '../../styles/css/Order/OrderHistory.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sort
  const [sortBy, setSortBy] = useState('date'); // 'date', 'status', 'total'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  const refreshOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      setRefreshing(true);
      const data = await getUserOrders();
      
      if (!data || !Array.isArray(data)) {
        console.error("Dữ liệu đơn hàng không hợp lệ:", data);
        setError("Dữ liệu đơn hàng không hợp lệ");
      } else {
        setOrders(data);
        setFilteredOrders(data);
        setError(null);
      }
    } catch (err) {
      console.error("Error refreshing orders:", err);
      setError(err.message || "Không thể cập nhật danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders();
        console.log("User orders:", data);
        
        // Kiểm tra dữ liệu trả về
        if (!data || !Array.isArray(data)) {
          console.error("Dữ liệu đơn hàng không hợp lệ:", data);
          setOrders([]);
          setFilteredOrders([]);
          setError("Dữ liệu đơn hàng không hợp lệ");
        } else {
          setOrders(data);
          setFilteredOrders(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Apply filters and sort
  useEffect(() => {
    if (!orders.length) return;
    
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.items && order.items.some(item => item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'total') {
        return sortOrder === 'asc'
          ? (a.totalAmount || 0) - (b.totalAmount || 0)
          : (b.totalAmount || 0) - (a.totalAmount || 0);
      } else if (sortBy === 'status') {
        const statusOrder = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const aIndex = statusOrder.indexOf(a.status || '');
        const bIndex = statusOrder.indexOf(b.status || '');
        return sortOrder === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      }
      return 0;
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log("Không có dữ liệu ngày:", dateString);
      return 'N/A';
    }
    
    try {
      console.log("Dữ liệu ngày nhận được:", dateString);
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.error("Không thể chuyển đổi thành ngày hợp lệ:", dateString);
        return 'N/A';
      }
      
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      console.error("Lỗi khi format ngày:", error, "với dateString:", dateString);
      return 'N/A';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Không xác định';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'processing': return faShoppingBag;
      case 'shipped': return faTruck;
      case 'delivered': return faCheck;
      case 'cancelled': return faXmark;
      default: return faShoppingBag;
    }
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  // Hiển thị màn hình yêu cầu đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="order-history-container">
        <div className="no-auth-message">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="mb-4 text-yellow-500" />
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
          <div className="mt-4 flex gap-4">
            <button 
              onClick={() => navigate('/login', { state: { from: '/orders' } })}
              className="login-button"
            >
              Đăng nhập
            </button>
            <button 
              onClick={() => navigate('/')}
              className="home-button"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-history-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-error">
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h1>Lịch sử đơn hàng</h1>
      
      <div className="order-history-filter">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-actions">
          <div className="filter-group">
            <label><FontAwesomeIcon icon={faFilter} /> Lọc theo</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label><FontAwesomeIcon icon={faSort} /> Sắp xếp theo</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Ngày đặt hàng</option>
              <option value="total">Tổng tiền</option>
              <option value="status">Trạng thái</option>
            </select>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
          
          <button 
            className="refresh-button"
            onClick={refreshOrders}
            disabled={refreshing}
          >
            <FontAwesomeIcon icon={faRefresh} spin={refreshing} /> 
            {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
          </button>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <FontAwesomeIcon icon={faShoppingBag} size="3x" />
          <h2>Không có đơn hàng nào</h2>
          <p>Bạn chưa có đơn hàng nào hoặc không có đơn hàng phù hợp với bộ lọc.</p>
          <Link to="/products" className="shop-now-button">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map(order => (
            <div key={order._id || order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <h3>Đơn hàng #{order.orderNumber}</h3>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
              
              <div className="order-items-preview">
                {order.items && order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="order-item-preview">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-meta">
                        {item.quantity} x {(item.price || 0).toLocaleString()}đ
                        {item.color && ` - Màu: ${item.color}`}
                        {item.size && ` - Size: ${item.size}`}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items && order.items.length > 2 && (
                  <div className="more-items">
                    +{order.items.length - 2} sản phẩm khác
                  </div>
                )}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Tổng tiền:</span>
                  <span className="total-amount">{(order.totalAmount || 0).toLocaleString()}đ</span>
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order._id || order.id}`} className="view-detail-button">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 