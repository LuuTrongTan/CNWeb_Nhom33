import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import OrderStatus from "../../components/Order/OrderStatus";
import { format, parseISO, isBefore, isAfter, startOfDay, endOfDay, isEqual } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "../../services/api.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSync,
  faFilter,
  faEye,
  faEdit,
  faInfoCircle,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faCircleCheck,
  faBoxOpen,
  faShoppingCart,
  faCalendarAlt,
  faMoneyBillWave,
  faTag,
  faCreditCard,
  faCheck,
  faUserAlt,
  faExchangeAlt,
  faTimes,
  faDownload,
  faHistory,
  faList
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/Order/OrderManagement.css";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ 
    from: "", 
    to: new Date().toISOString().split('T')[0] // Mặc định ngày kết thúc là hôm nay
  });
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Thống kê nhanh
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    revenue: 0,
    pending: 0
  });

  const [allOrders, setAllOrders] = useState([]); // Lưu tất cả đơn hàng cho lọc phía client

  useEffect(() => {
    fetchOrderStats();
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (allOrders.length > 0) {
      applyFiltersAndPaginate();
    } else {
      fetchOrders(); // Fallback nếu chưa có dữ liệu
    }
  }, [page, statusFilter, isDateFilterActive, dateRange, allOrders, searchTerm, paymentFilter]);

  // Hàm lấy thống kê tổng từ API
  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      // Gọi API để lấy thống kê tổng quan từ backend
      const response = await apiClient.get('/admin/orders/stats');
      
      if (response && response.statusStats) {
        // Backend trả về thống kê theo dạng nhóm theo trạng thái
        const { statusStats, dailyStats } = response;
        
        // Tính tổng số đơn hàng
        const totalOrders = statusStats.reduce((sum, stat) => sum + stat.count, 0);
        
        // Tính tổng doanh thu - Cần phải lấy tất cả đơn hàng để kiểm tra isPaid
        // API thống kê không phân biệt đơn đã thanh toán và chưa thanh toán
        const allOrdersResponse = await apiClient.get('/admin/orders', { params: { limit: 1000 } });
        let totalRevenue = 0;
        
        if (allOrdersResponse && allOrdersResponse.results && Array.isArray(allOrdersResponse.results)) {
          totalRevenue = allOrdersResponse.results
            .filter(order => order.isPaid === true) // Chỉ tính đơn hàng đã thanh toán
            .reduce((total, order) => total + (order.totalAmount || 0), 0);
        }
        
        // Đếm số đơn hàng đang pending
        const pendingOrders = statusStats.find(stat => stat._id === 'pending')?.count || 0;
        
        // Tính số đơn hàng trong ngày hôm nay
        const today = new Date();
        // Đặt giờ về 00:00:00 theo múi giờ Việt Nam (GMT+7)
        const vietnamOffset = 7 * 60; // Múi giờ GMT+7 tính bằng phút
        const localOffset = today.getTimezoneOffset(); // Chênh lệch múi giờ local với UTC
        const totalOffset = vietnamOffset + localOffset; // Tổng chênh lệch cần bù trừ
        
        // Tạo ngày mới với thời gian 00:00:00 theo múi giờ Việt Nam
        const todayVN = new Date(today);
        todayVN.setHours(0, 0, 0, 0);
        todayVN.setMinutes(todayVN.getMinutes() + totalOffset);
        
        const todayString = todayVN.toISOString().split('T')[0];
        const todayOrders = dailyStats.find(day => day._id === todayString)?.count || 0;
        
        // Cập nhật state
        setStats({
          total: totalOrders,
          today: todayOrders,
          revenue: totalRevenue,
          pending: pendingOrders
        });
      } else {
        // Nếu API không trả về đúng định dạng, lấy tất cả đơn hàng để tính toán
        await fetchAllOrdersForStats();
      }
    } catch (err) {
      console.error("Lỗi khi lấy thống kê đơn hàng:", err);
      // Thử phương án dự phòng
      await fetchAllOrdersForStats();
    } finally {
      setStatsLoading(false);
    }
  };

  // Phương án dự phòng: lấy tất cả đơn hàng để tính toán thống kê
  const fetchAllOrdersForStats = async () => {
    try {
      // Lấy tất cả đơn hàng (không phân trang)
      const response = await apiClient.get('/admin/orders', { params: { limit: 1000 } });
      
      if (response && response.results && Array.isArray(response.results)) {
        calculateStats(response.results);
      } else {
        // Nếu không lấy được dữ liệu, hiển thị 0
        setStats({
          total: 0,
          today: 0,
          revenue: 0,
          pending: 0
        });
      }
    } catch (err) {
      console.error("Lỗi khi lấy tất cả đơn hàng để tính thống kê:", err);
      setStats({
        total: 0,
        today: 0,
        revenue: 0,
        pending: 0
      });
    }
  };

  // Tính toán thống kê từ tất cả đơn hàng
  const calculateStats = (orderData) => {
    if (!Array.isArray(orderData)) {
      console.error("Dữ liệu đơn hàng không hợp lệ:", orderData);
      return;
    }

    // Tạo ngày mới với thời gian 00:00:00 theo múi giờ Việt Nam (GMT+7)
    const today = new Date();
    const vietnamOffset = 7 * 60; // Múi giờ GMT+7 tính bằng phút
    const localOffset = today.getTimezoneOffset(); // Chênh lệch múi giờ local với UTC
    const totalOffset = vietnamOffset + localOffset; // Tổng chênh lệch cần bù trừ
    
    // Tạo ngày mới với thời gian 00:00:00 theo múi giờ Việt Nam
    const todayVN = new Date(today);
    todayVN.setHours(0, 0, 0, 0);
    todayVN.setMinutes(todayVN.getMinutes() + totalOffset);
    
    const todayOrders = orderData.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= todayVN;
    });
    
    const totalRevenue = orderData.reduce((total, order) => {
      // Chỉ tính doanh thu từ đơn hàng đã thanh toán
      if (order.isPaid === true) {
        return total + (order.totalAmount || 0);
      }
      return total;
    }, 0);
    
    const pendingOrders = orderData.filter(order => order.status === 'pending').length;
    
    setStats({
      total: orderData.length,
      today: todayOrders.length,
      revenue: totalRevenue,
      pending: pendingOrders
    });
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      // Cố gắng lấy một số lượng lớn đơn hàng
      const response = await apiClient.get('/admin/orders', { params: { limit: 1000 } });
      
      if (response && response.results && Array.isArray(response.results)) {
        setAllOrders(response.results);
      }
    } catch (err) {
      console.error("Lỗi khi lấy tất cả đơn hàng:", err);
      // Fallback về phương thức cũ
    fetchOrders();
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPaginate = () => {
    let filteredResults = [...allOrders];
    
    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filteredResults = filteredResults.filter(order => order.status === statusFilter);
    }

    // Lọc theo trạng thái thanh toán
    if (paymentFilter !== "all") {
      filteredResults = filteredResults.filter(order => {
        if (paymentFilter === "paid") return order.isPaid === true;
        if (paymentFilter === "unpaid") return order.isPaid === false;
        return true;
      });
    }
    
    // Lọc theo ngày tháng nếu đã kích hoạt
    if (isDateFilterActive) {
      const fromDate = dateRange.from ? startOfDay(new Date(dateRange.from)) : null;
      const toDate = dateRange.to ? endOfDay(new Date(dateRange.to)) : null;
      
      filteredResults = filteredResults.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        
        // Kiểm tra orderDate có trong khoảng fromDate và toDate không
        const isAfterFromDate = fromDate ? isAfter(orderDate, fromDate) || isEqual(orderDate, fromDate) : true;
        const isBeforeToDate = toDate ? isBefore(orderDate, toDate) || isEqual(orderDate, toDate) : true;
        
        return isAfterFromDate && isBeforeToDate;
      });
    }
    
    // Lọc theo từ khóa tìm kiếm nếu có
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      
      filteredResults = filteredResults.filter(order => {
        // Tìm kiếm theo mã đơn hàng
        const orderNumber = formatOrderNumber(order).toLowerCase();
        if (orderNumber.includes(searchLower)) return true;
        
        // Tìm kiếm theo tên khách hàng
        const customerName = order.shippingAddress?.fullName?.toLowerCase() || '';
        if (customerName.includes(searchLower)) return true;
        
        // Tìm kiếm theo số điện thoại
        const phone = order.shippingAddress?.phone?.toLowerCase() || '';
        if (phone.includes(searchLower)) return true;
        
        // Tìm kiếm theo địa chỉ
        const address = order.shippingAddress?.address?.toLowerCase() || '';
        if (address.includes(searchLower)) return true;
        
        // Tìm kiếm theo ID
        const orderId = (order._id || order.id || '').toLowerCase();
        if (orderId.includes(searchLower)) return true;
        
        return false;
      });
    }
    
    // Tính toán tổng số trang
    const totalItems = filteredResults.length;
    const itemsPerPage = 10;
    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Phân trang
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);
    
    // Cập nhật state
    setOrders(paginatedResults);
    setTotalPages(calculatedTotalPages);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/admin/orders?page=${page}&limit=10`;
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await apiClient.get(url);
      const results = response.results || [];
      
      setOrders(results);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn hàng:", err);
      setError(
        err.message || "Không thể tải danh sách đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      displayToast("Đang cập nhật trạng thái đơn hàng...", "info");
      
      const orderId = order._id || order.id;
      
      if (!orderId) {
        throw new Error("Không thể cập nhật đơn hàng: Thiếu ID");
      }
      
        const response = await apiClient.patch(`/admin/orders/${orderId}`, { 
          status: newStatus 
        });
        
        setOrders(
          orders.map((o) => {
            if ((o._id && o._id === orderId) || (o.id && o.id === orderId)) {
              return { ...o, status: newStatus };
            }
            return o;
          })
        );
        
      // Cập nhật lại thống kê sau khi thay đổi trạng thái
      fetchOrderStats();
      
        displayToast(`Đơn hàng ${order.orderNumber || formatOrderNumber(order)} đã được cập nhật thành công!`, "success");
      } catch (err) {
      displayToast(`Lỗi khi cập nhật trạng thái: ${err.message}`, "error");
    }
  };

  const handlePaymentStatusChange = async (order) => {
    try {
      displayToast("Đang cập nhật trạng thái thanh toán...", "info");
      
      const orderId = order._id || order.id;
      
      if (!orderId) {
        throw new Error("Không thể cập nhật đơn hàng: Thiếu ID");
      }
      
      const newPaymentStatus = !order.isPaid;
      
        const response = await apiClient.patch(`/admin/orders/${orderId}`, { 
          isPaid: newPaymentStatus 
        });
        
        setOrders(
          orders.map((o) => {
            if ((o._id && o._id === orderId) || (o.id && o.id === orderId)) {
              return { ...o, isPaid: newPaymentStatus };
            }
            return o;
          })
        );
        
      // Cập nhật lại thống kê sau khi thay đổi trạng thái thanh toán
      fetchOrderStats();
      
        displayToast(
          `Đơn hàng ${order.orderNumber || formatOrderNumber(order)} đã được cập nhật trạng thái thanh toán thành ${newPaymentStatus ? 'đã thanh toán' : 'chưa thanh toán'}!`, 
          "success"
        );
      } catch (err) {
      displayToast(`Lỗi khi cập nhật trạng thái thanh toán: ${err.message}`, "error");
    }
  };

  const displayToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Áp dụng tìm kiếm và quay về trang 1
    setPage(1);
    applyFiltersAndPaginate();
    
    // Hiển thị thông báo
    if (searchTerm.trim()) {
      displayToast(`Đang tìm kiếm đơn hàng với từ khóa "${searchTerm}"`, "info");
    } else {
      displayToast("Đã xóa tìm kiếm", "info");
    }
  };

  // Tạo mã đơn hàng hiển thị từ _id và ngày tạo
  const formatOrderNumber = (order) => {
    if (!order) return 'N/A';
    
    if (order.orderNumber) {
      return order.orderNumber;
    }
    
    const orderId = order._id || order.id;
    if (orderId) {
      try {
        const idPrefix = orderId.substring(0, 3).toUpperCase();
        
        const timestamp = order.createdAt 
          ? new Date(order.createdAt).getTime() 
          : Date.now();
        
        const timeStr = timestamp.toString().slice(-6);
        
        return `DH-${idPrefix}-${timeStr}`;
      } catch (error) {
        return `ID: ${orderId.substring(0, 8)}...`;
      }
    }
    
    return 'N/A';
  };

  // Làm mới tất cả dữ liệu
  const handleRefresh = async () => {
    try {
      displayToast("Đang làm mới dữ liệu...", "info");
      await Promise.all([fetchAllOrders(), fetchOrderStats()]);
      // Reset các bộ lọc
      setStatusFilter("all");
      setDateRange({ from: "", to: new Date().toISOString().split('T')[0] });
      setIsDateFilterActive(false);
      setPage(1);
      displayToast("Cập nhật dữ liệu thành công!", "success");
    } catch (err) {
      displayToast("Gặp lỗi khi cập nhật dữ liệu", "error");
    }
  };

  // Xuất dữ liệu đơn hàng (giả lập)
  const handleExportOrders = () => {
    displayToast("Đang chuẩn bị xuất dữ liệu đơn hàng...", "info");
    
    // Giả lập quá trình xuất file
    setTimeout(() => {
      displayToast("Xuất dữ liệu thành công!", "success");
    }, 1500);
  };

  // Xử lý khi nhấn nút áp dụng bộ lọc ngày tháng
  const handleApplyDateFilter = () => {
    // Kiểm tra nếu cả hai giá trị đều trống thì không kích hoạt bộ lọc
    if (!dateRange.from && !dateRange.to) {
      setIsDateFilterActive(false);
      displayToast("Vui lòng chọn ít nhất một khoảng thời gian", "info");
      return;
    }

    // Validate ngày tháng
    if (dateRange.from && dateRange.to && dateRange.from > dateRange.to) {
      displayToast("Ngày bắt đầu không thể lớn hơn ngày kết thúc", "error");
      return;
    }

    setIsDateFilterActive(true);
    setPage(1); // Reset về trang 1 khi áp dụng bộ lọc mới
    displayToast("Đã áp dụng bộ lọc theo ngày tháng", "success");
  };

  // Xóa bộ lọc ngày tháng
  const clearDateFilter = () => {
    setDateRange({ from: "", to: new Date().toISOString().split('T')[0] });
    setIsDateFilterActive(false);
    setPage(1);
    displayToast("Đã xóa bộ lọc theo ngày tháng", "info");
  };

  if (loading && orders.length === 0)
    return (
      <div className="order-management-container">
        <div className="loading-overlay">
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSync} spin className="spinner-icon" />
            <p>Đang tải dữ liệu đơn hàng...</p>
            </div>
            </div>
          </div>
    );

  if (error && orders.length === 0)
    return (
      <div className="order-management-container">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchOrders}>
            <FontAwesomeIcon icon={faSync} className="retry-icon" /> Thử lại
          </button>
        </div>
      </div>
    );

    return (
    <div className="order-management-container">
      <header className="page-header">
        <div className="header-content">
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} className="header-icon" />
              Quản lý đơn hàng
          </h1>
          <div className="header-actions">
            <button className="action-button export-button" onClick={handleExportOrders}>
              <FontAwesomeIcon icon={faDownload} className="button-icon" />
              <span className="button-text">Xuất dữ liệu</span>
            </button>
            <button 
              className="action-button refresh-button"
              onClick={handleRefresh}
            >
              <FontAwesomeIcon icon={faSync} className={statsLoading || loading ? "button-icon spin" : "button-icon"} />
              <span className="button-text">Làm mới</span>
            </button>
                </div>
              </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card total-orders">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faList} />
                </div>
          <div className="stat-content">
            <p className="stat-title">Tổng đơn hàng</p>
            {statsLoading ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">{stats.total}</p>
            )}
              </div>
            </div>
        
        <div className="stat-card today-orders">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className="stat-content">
            <p className="stat-title">Đơn hàng hôm nay</p>
            {statsLoading ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">{stats.today}</p>
            )}
        </div>
      </div>
        
        <div className="stat-card total-revenue">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>
          <div className="stat-content">
            <p className="stat-title">Tổng doanh thu</p>
            {statsLoading ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">{stats.revenue.toLocaleString()}<span className="currency">₫</span></p>
            )}
              </div>
              </div>
        
        <div className="stat-card pending-orders">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHistory} />
            </div>
          <div className="stat-content">
            <p className="stat-title">Đơn chờ xử lý</p>
            {statsLoading ? (
              <p className="stat-value loading">...</p>
            ) : (
              <p className="stat-value">{stats.pending}</p>
            )}
          </div>
        </div>
      </div>

      <div className="order-controls">
        <div className="filters-bar">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <div className="search-icon-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    className="clear-search-button"
                    onClick={() => {
                      setSearchTerm('');
                      setPage(1);
                      setTimeout(() => applyFiltersAndPaginate(), 0);
                      displayToast("Đã xóa từ khóa tìm kiếm", "info");
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </form>
          </div>
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
            className="filter-select payment-filter-select"
            style={{ minWidth: 160, maxWidth: 200 }}
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
          <div className="filters-container">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
              className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đang giao hàng</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
            
                <button
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
                >
              <FontAwesomeIcon icon={faFilter} /> Bộ lọc nâng cao
                </button>
          </div>
              </div>
              
        {showFilters && (
          <div className="advanced-filters">
            <div className="date-filters">
              <div className="date-filter">
                <label>Từ ngày:</label>
                  <input
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
                  </div>
              <div className="date-filter">
                <label>Đến ngày:</label>
                <input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
              <div className="date-filter-actions">
                  <button
                  className="apply-filter-button"
                  onClick={handleApplyDateFilter}
                  >
                  Áp dụng
                  </button>
                {isDateFilterActive && (
                  <button 
                    className="clear-filter-button"
                    onClick={clearDateFilter}
                  >
                    Xóa bộ lọc
                  </button>
                )}
                </div>
              {isDateFilterActive && (
                <div className="active-filter-badge">
                  <FontAwesomeIcon icon={faCalendarAlt} className="filter-badge-icon" />
                  <span>
                    {dateRange.from ? format(parseISO(dateRange.from), 'dd/MM/yyyy', { locale: vi }) : 'Tất cả'} 
                    - 
                    {dateRange.to ? format(parseISO(dateRange.to), 'dd/MM/yyyy', { locale: vi }) : 'Tất cả'}
                  </span>
            </div>
              )}
          </div>
                    </div>
        )}
                    </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Thao tác</th>
                </tr>
              </thead>
          <tbody>
                {orders.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="7">
                  <div className="empty-state">
                    <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
                    <h3>Không có đơn hàng nào</h3>
                    <p>Không tìm thấy đơn hàng phù hợp với bộ lọc đã chọn</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order._id || order.id} 
                  className={hoveredRowId === (order._id || order.id) ? 'highlight-row' : ''}
                      onMouseEnter={() => setHoveredRowId(order._id || order.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                  <td className="order-id-cell">
                    <div className="order-code">
                      <FontAwesomeIcon icon={faTag} className="order-code-icon" />
                      <span>{formatOrderNumber(order)}</span>
                        </div>
                      </td>
                  <td className="customer-cell">
                    <div className="customer-info">
                      <div className="customer-avatar">
                            {order.shippingAddress?.fullName ? (
                          order.shippingAddress.fullName.charAt(0).toUpperCase()
                            ) : (
                              <FontAwesomeIcon icon={faUserAlt} />
                            )}
                          </div>
                      <div className="customer-detail">
                        <p className="customer-name">
                              {order.shippingAddress?.fullName || 'Không có tên'}
                        </p>
                        <p className="customer-phone">
                                {order.shippingAddress?.phone || 'Không có SĐT'}
                        </p>
                          </div>
                        </div>
                      </td>
                  <td className="date-cell">
                    <div className="order-date">
                      <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                            {formatDate(order.createdAt)}
                        </div>
                      </td>
                  <td className="amount-cell">
                    <div className="order-amount">
                      {(order.totalAmount || 0).toLocaleString()}đ
                        </div>
                      </td>
                  <td className="status-cell">
                        <OrderStatus status={order.status} />
                      </td>
                  <td className="payment-cell">
                        <button
                          onClick={() => handlePaymentStatusChange(order)}
                      className={`payment-status ${order.isPaid ? 'paid' : 'unpaid'}`}
                    >
                      <FontAwesomeIcon 
                        icon={order.isPaid ? faCheck : faCreditCard} 
                        className="payment-icon" 
                      />
                              {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </button>
                      </td>
                  <td className="actions-cell">
                    <div className="actions-container">
                          <select
                        className="status-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                          >
                            <option value="pending">Chờ xác nhận</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đang giao hàng</option>
                            <option value="delivered">Đã giao hàng</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                          <Link
                            to={`/orders/${order._id || order.id}`}
                        className="view-button"
                            title="Xem chi tiết"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
        <div className="pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
            className={`pagination-button ${page === 1 ? 'disabled' : ''}`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

          <div className="pagination-info">
            <span>Trang</span>
            <span className="current-page">{page}</span>
            <span>trên {totalPages}</span>
                </div>

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
            className={`pagination-button ${page === totalPages ? 'disabled' : ''}`}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
          )}
      
      {/* Thông báo Toast */}
      {showToast && (
        <div className={`toast-container ${toastType}`}>
          <div className="toast-icon">
            {toastType === 'success' && <FontAwesomeIcon icon={faCheck} />}
            {toastType === 'error' && <FontAwesomeIcon icon={faTimes} />}
            {toastType === 'info' && <FontAwesomeIcon icon={faInfoCircle} />}
          </div>
          <div className="toast-message">{toastMessage}</div>
          <button className="toast-close" onClick={() => setShowToast(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
