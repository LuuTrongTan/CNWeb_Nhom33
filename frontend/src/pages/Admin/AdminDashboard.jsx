import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  faUsers,
  faShoppingCart,
  faMoneyBillWave,
  faBoxes,
  faChartLine,
  faWarehouse,
  faBoxOpen,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/css/Admin/AdminDashboard.css";
import {
  getProductBestSeller,
  fetchProductsAPI,
} from "../../service/productAPI";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import apiClient from "../../services/api.service";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month"); // 'day', 'month', 'year'
  const [products, setProducts] = useState([]);

  const mockData = {
    revenue: {
      total: 178000000,
      previousPeriod: 150000000,
      percentChange: 18.67,
    },
    orders: {
      total: 378,
      previousPeriod: 342,
      percentChange: 10.53,
    },
    customers: {
      total: 520,
      previousPeriod: 480,
      percentChange: 8.33,
      new: 42,
    },
    products: {
      total: 536,
      totalStock: 4782,
      lowStock: 12,
      outOfStock: 5,
    },
    topSellingProducts: [],
    recentOrders: [
      {
        id: "ORD1023",
        customer: "Nguyễn Văn A",
        date: "2023-08-15",
        status: "delivered",
        total: 1250000,
      },
      {
        id: "ORD1022",
        customer: "Trần Thị B",
        date: "2023-08-15",
        status: "processing",
        total: 850000,
      },
      {
        id: "ORD1021",
        customer: "Lê Văn C",
        date: "2023-08-14",
        status: "shipping",
        total: 2340000,
      },
      {
        id: "ORD1020",
        customer: "Phạm Thị D",
        date: "2023-08-14",
        status: "completed",
        total: 1780000,
      },
      {
        id: "ORD1019",
        customer: "Hoàng Văn E",
        date: "2023-08-13",
        status: "cancelled",
        total: 950000,
      },
    ],
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentOrders();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const productsResponse = await fetchProductsAPI();
      let sum = 0;
      productsResponse.data.forEach((product) => {
        sum += product.revenue;
      });
      console.log("Tổng doanh thu:", sum);

      const response = await getProductBestSeller("bestSelling");
      console.log("sdfgsdfg", response.products);

      mockData.topSellingProducts = await response.products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        soldCount: product.soldCount,
        stock: product.stock,
        revenue: product.revenue, // virtual field đã được khai báo
      }));

      mockData.revenue.total = sum;

      mockData.products.total = productsResponse.data.length;
      mockData.products.outOfStock = productsResponse.data.filter(
        (p) => p.stock === 0
      ).length;

      mockData.products.lowStock = productsResponse.data.filter(
        (p) => p.stock <= 20
      ).length;

      setDashboardData(mockData);

      // setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");

      // Dữ liệu mẫu để demo

      setDashboardData(mockData);
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await apiClient.get("/admin/orders?page=1&limit=5");
      if (response && response.results) {
        // Cập nhật mockData với dữ liệu thực tế
        mockData.recentOrders = response.results.map((order) => ({
          id: order._id.substring(0, 8),
          customer: order.shippingAddress?.fullName || "Khách hàng",
          date: order.createdAt,
          status: order.status,
          total: order.totalAmount,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng gần đây:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "status-success";
      case "processing":
        return "status-warning";
      case "shipping":
        return "status-info";
      case "cancelled":
        return "status-danger";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Đã giao";
      case "completed":
        return "Hoàn thành";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log("Không có dữ liệu ngày trong AdminDashboard:", dateString);
      return "N/A";
    }

    try {
      console.log("Dữ liệu ngày nhận được trong AdminDashboard:", dateString);
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.error(
          "Không thể chuyển đổi thành ngày hợp lệ trong AdminDashboard:",
          dateString
        );
        return "N/A";
      }

      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.error(
        "Lỗi khi format ngày trong AdminDashboard:",
        error,
        "với dateString:",
        dateString
      );
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="admin-dashboard-error">
        <p>Lỗi: {error}</p>
        <button onClick={fetchDashboardData}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="period-filter">
          <label>Thời gian:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="period-select"
          >
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#4CAF50" }}>
            <FontAwesomeIcon icon={faMoneyBillWave} />
          </div>
          <div className="stat-details">
            <h3>Doanh thu</h3>
            <p className="stat-value">
              {formatCurrency(dashboardData.revenue.total)}
            </p>
            <p
              className={`stat-change ${
                dashboardData.revenue.percentChange >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {dashboardData.revenue.percentChange >= 0 ? "+" : ""}
              {dashboardData.revenue.percentChange.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#2196F3" }}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="stat-details">
            <h3>Đơn hàng</h3>
            <p className="stat-value">{dashboardData.orders.total}</p>
            <p
              className={`stat-change ${
                dashboardData.orders.percentChange >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {dashboardData.orders.percentChange >= 0 ? "+" : ""}
              {dashboardData.orders.percentChange.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#FF9800" }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-details">
            <h3>Khách hàng</h3>
            <p className="stat-value">{dashboardData.customers.total}</p>
            <p className="stat-subtitle">Mới: {dashboardData.customers.new}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#9C27B0" }}>
            <FontAwesomeIcon icon={faBoxes} />
          </div>
          <div className="stat-details">
            <h3>Sản phẩm</h3>
            <p className="stat-value">{dashboardData.products.total}</p>
            <p className="stat-subtitle">
              Hết hàng: {dashboardData.products.outOfStock}
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget inventory-widget">
          <div className="widget-header">
            <h2>Tình trạng kho hàng</h2>
            {/* <Link to="/admin/products" className="view-all">
              Xem tất cả
            </Link> */}
          </div>
          <div className="inventory-stats">
            <div className="inventory-stat-item">
              <div
                className="stat-icon small"
                style={{ backgroundColor: "#2196F3" }}
              >
                <FontAwesomeIcon icon={faWarehouse} />
              </div>
              <div className="stat-details">
                <h4>Tổng sản phẩm</h4>
                <p>{dashboardData.products.total}</p>
              </div>
            </div>
            <div className="inventory-stat-item">
              <div
                className="stat-icon small"
                style={{ backgroundColor: "#FF9800" }}
              >
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <div className="stat-details">
                <h4>Sắp hết hàng</h4>
                <p>{dashboardData.products.lowStock}</p>
              </div>
            </div>
            <div className="inventory-stat-item">
              <div
                className="stat-icon small"
                style={{ backgroundColor: "#F44336" }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div className="stat-details">
                <h4>Hết hàng</h4>
                <p>{dashboardData.products.outOfStock}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="widget performance-widget">
          <div className="widget-header">
            <h2>Sản phẩm bán chạy</h2>
            {/* <Link to="/admin/soldCount-performance" className="view-all">
              Xem tất cả
            </Link> */}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
                <th>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topSellingProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.soldCount}</td>
                  <td>{formatCurrency(product.revenue)}</td>
                  <td>{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="widget orders-widget">
        <div className="widget-header">
          <h2>Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="view-all">
            Xem tất cả
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recentOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{formatDate(order.date)}</td>
                <td>{formatCurrency(order.total)}</td>
                <td>
                  <span
                    className={`order-status ${getStatusClass(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
