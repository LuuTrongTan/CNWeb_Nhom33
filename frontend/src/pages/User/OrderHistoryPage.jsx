import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserOrders, cancelOrder as cancelOrderAPI, getOrderStats as getOrderStatsAPI } from '../../service/orderAPI';
import { toast } from 'react-toastify';
import './OrderHistoryPage.css';

// Import FontAwesome Icons
import { 
  faShoppingBag, faSearch, faFilter, faClock, faSpinner, 
  faExclamationTriangle, faBoxOpen, faEye, faTimes, 
  faChevronLeft, faChevronRight, faCheckCircle, faTimesCircle,
  faShoppingCart, faShippingFast, faTruck, faStore
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const OrderHistoryPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  const dropdownRef = useRef(null);
  const topRef = useRef(null);

  // Fetch orders from API
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Lưu token vào localStorage nếu chưa có
    if (currentUser.token && !localStorage.getItem('token')) {
      localStorage.setItem('token', currentUser.token);
    }
    
    fetchOrders();
  }, [currentUser, navigate]);

  // Filter orders based on search term and active filter
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let result = [...orders];

    // Apply filter by status
    if (activeFilter !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === activeFilter);
    }

    // Apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOrders(result);
    
    // Calculate total pages
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    
    // Reset to first page if filters change
    if (currentPage > Math.ceil(result.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [orders, searchTerm, activeFilter, itemsPerPage]);

  // Calculate order statistics when orders change
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const stats = await getOrderStatsAPI();
        setOrderStats(stats);
      } catch (err) {
        console.error('Lỗi khi tải thống kê đơn hàng:', err);
        // Fallback to manual calculation if API fails
        if (orders.length) {
          const manualStats = {
            all: orders.length,
            pending: orders.filter(order => order.status === 'pending').length,
            processing: orders.filter(order => order.status === 'processing').length,
            shipped: orders.filter(order => order.status === 'shipped').length,
            delivered: orders.filter(order => order.status === 'delivered').length,
            cancelled: orders.filter(order => order.status === 'cancelled').length
          };
          setOrderStats(manualStats);
        }
      }
    };

    fetchOrderStats();
  }, [orders]);

  // Cuộn lên đầu trang khi chuyển trang
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserOrders(1, 100); // Lấy tối đa 100 đơn hàng

      // Kiểm tra cấu trúc dữ liệu trả về
      const orderData = response.orders || response.data || [];
      
      // Sort orders by date (newest first)
      const sortedOrders = orderData.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      setTotalPages(Math.ceil(sortedOrders.length / itemsPerPage));
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await cancelOrderAPI(orderId);
      
      // Update order status in state
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      );
      
      setOrders(updatedOrders);
      toast.success('Đơn hàng đã được hủy thành công!');
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FontAwesomeIcon icon={faClock} />;
      case 'processing':
        return <FontAwesomeIcon icon={faShippingFast} />;
      case 'shipped':
        return <FontAwesomeIcon icon={faTruck} />;
      case 'delivered':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} />;
      default:
        return <FontAwesomeIcon icon={faShoppingBag} />;
    }
  };

  // Get current items for current page
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  if (isLoading) {
    return (
      <div className="order-history-page loading">
        <div className="spinner">
          <FontAwesomeIcon icon={faSpinner} size="3x" />
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-page error">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h3>Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <button onClick={fetchOrders}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-page" ref={topRef}>
      {/* Header */}
      <div className="page-header">
        <h1>Lịch sử đơn hàng</h1>
        <p>Theo dõi và quản lý các đơn hàng của bạn</p>
      </div>

      {/* Order statistics */}
      <div className="order-statistics">
        <div className="stat-item">
          <div className="stat-icon all">
            <FontAwesomeIcon icon={faShoppingBag} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.all}</div>
            <div className="stat-title">Tất cả</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon pending">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.pending}</div>
            <div className="stat-title">Chờ xác nhận</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon processing">
            <FontAwesomeIcon icon={faShippingFast} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.processing}</div>
            <div className="stat-title">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon shipped">
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.shipped}</div>
            <div className="stat-title">Đang vận chuyển</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon delivered">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.delivered}</div>
            <div className="stat-title">Đã giao</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon cancelled">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{orderStats.cancelled}</div>
            <div className="stat-title">Đã hủy</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="order-filters">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-label">
            <FontAwesomeIcon icon={faFilter} />
            <span>Lọc theo trạng thái:</span>
          </div>
          <div className="filter-buttons">
            <button
              className={activeFilter === 'all' ? 'active' : ''}
              onClick={() => handleFilterChange('all')}
            >
              Tất cả
            </button>
            <button
              className={activeFilter === 'pending' ? 'active' : ''}
              onClick={() => handleFilterChange('pending')}
            >
              Chờ xác nhận
            </button>
            <button
              className={activeFilter === 'processing' ? 'active' : ''}
              onClick={() => handleFilterChange('processing')}
            >
              Đang xử lý
            </button>
            <button
              className={activeFilter === 'shipped' ? 'active' : ''}
              onClick={() => handleFilterChange('shipped')}
            >
              Đang vận chuyển
            </button>
            <button
              className={activeFilter === 'delivered' ? 'active' : ''}
              onClick={() => handleFilterChange('delivered')}
            >
              Đã giao
            </button>
            <button
              className={activeFilter === 'cancelled' ? 'active' : ''}
              onClick={() => handleFilterChange('cancelled')}
            >
              Đã hủy
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <div className="empty-orders">
          <FontAwesomeIcon icon={faBoxOpen} size="3x" />
          <h3>Không tìm thấy đơn hàng</h3>
          {activeFilter !== 'all' || searchTerm ? (
            <p>Không có đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
          ) : (
            <p>Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
          )}
          <Link to="/products" className="shop-now-btn">
            <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '0.5rem' }} />
            Mua sắm ngay
          </Link>
        </div>
      )}

      {/* Orders table */}
      {filteredOrders.length > 0 && (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th className="order-items">Sản phẩm</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentItems().map((order) => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderId}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="item-list">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div className="order-item" key={index}>
                          <img 
                            src={item.image || 'https://via.placeholder.com/40'} 
                            alt={item.name} 
                          />
                          <div>
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="more-items">
                          + {order.items.length - 2} sản phẩm khác
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={`order-status ${order.status}`}>
                      {getStatusIcon(order.status)}
                      <span>
                        {order.status === 'pending' && 'Chờ xác nhận'}
                        {order.status === 'processing' && 'Đang xử lý'}
                        {order.status === 'shipped' && 'Đang vận chuyển'}
                        {order.status === 'delivered' && 'Đã giao'}
                        {order.status === 'cancelled' && 'Đã hủy'}
                      </span>
                    </div>
                  </td>
                  <td className="order-total">{formatCurrency(order.totalAmount)}</td>
                  <td className="actions">
                    <button 
                      className="view-btn" 
                      onClick={() => navigate(`/order/${order._id}`)}
                      title="Xem chi tiết"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button 
                        className="cancel-btn" 
                        onClick={() => cancelOrder(order._id)}
                        title="Hủy đơn hàng"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          
          {/* First page */}
          {currentPage > 2 && (
            <button onClick={() => handlePageChange(1)}>1</button>
          )}
          
          {/* Ellipsis if needed */}
          {currentPage > 3 && <span>...</span>}
          
          {/* Previous page if not on first page */}
          {currentPage > 1 && (
            <button onClick={() => handlePageChange(currentPage - 1)}>
              {currentPage - 1}
            </button>
          )}
          
          {/* Current page */}
          <button className="active">{currentPage}</button>
          
          {/* Next page if not on last page */}
          {currentPage < totalPages && (
            <button onClick={() => handlePageChange(currentPage + 1)}>
              {currentPage + 1}
            </button>
          )}
          
          {/* Ellipsis if needed */}
          {currentPage < totalPages - 2 && <span>...</span>}
          
          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <button onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </button>
          )}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage; 