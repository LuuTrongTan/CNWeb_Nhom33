import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import SummaryCards from './SummaryCards';
import RevenueChart from './RevenueChart';
import TopProducts from './TopProducts';
import RecentOrders from './RecentOrders';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an actual API call
      // const response = await axios.get('/api/dashboard/summary');
      // const data = response.data.data;
      
      // For demo purposes, we'll simulate the data
      const simulatedData = {
        today: {
          revenue: 12500000,
          orders: 23,
          visitors: 245,
        },
        month: {
          revenue: 178000000,
          orders: 378,
          visitors: 7820,
        },
        inventory: {
          totalProducts: 536,
          totalStock: 4782,
          lowStock: 12,
          outOfStock: 5,
        },
        recentOrders: [
          {
            _id: '1',
            user: { name: 'Nguyễn Văn A', email: 'nguyena@example.com' },
            orderStatus: 'delivered',
            totalAmount: 1250000,
            createdAt: new Date('2023-08-15T08:32:45Z'),
          },
          {
            _id: '2',
            user: { name: 'Trần Thị B', email: 'tranb@example.com' },
            orderStatus: 'processing',
            totalAmount: 850000,
            createdAt: new Date('2023-08-15T10:15:22Z'),
          },
          {
            _id: '3',
            user: { name: 'Lê Văn C', email: 'lec@example.com' },
            orderStatus: 'shipping',
            totalAmount: 2340000,
            createdAt: new Date('2023-08-14T14:45:11Z'),
          },
          {
            _id: '4',
            user: { name: 'Phạm Thị D', email: 'phamd@example.com' },
            orderStatus: 'completed',
            totalAmount: 1780000,
            createdAt: new Date('2023-08-14T09:20:33Z'),
          },
          {
            _id: '5',
            user: { name: 'Hoàng Văn E', email: 'hoange@example.com' },
            orderStatus: 'cancelled',
            totalAmount: 950000,
            createdAt: new Date('2023-08-13T16:10:45Z'),
          },
        ],
        topProducts: [
          {
            _id: '1',
            name: 'Áo sơ mi trắng nam',
            price: 450000,
            sold: 125,
            stock: 75,
          },
          {
            _id: '2',
            name: 'Quần jean nữ ống rộng',
            price: 550000,
            sold: 98,
            stock: 42,
          },
          {
            _id: '3',
            name: 'Váy đầm hoa nữ',
            price: 650000,
            sold: 82,
            stock: 35,
          },
          {
            _id: '4',
            name: 'Áo thun nam thể thao',
            price: 280000,
            sold: 76,
            stock: 120,
          },
          {
            _id: '5',
            name: 'Áo khoác denim unisex',
            price: 750000,
            sold: 63,
            stock: 28,
          },
        ],
        revenueChartData: [
          { date: '01/08', revenue: 5200000 },
          { date: '02/08', revenue: 4800000 },
          { date: '03/08', revenue: 6100000 },
          { date: '04/08', revenue: 5400000 },
          { date: '05/08', revenue: 7500000 },
          { date: '06/08', revenue: 6800000 },
          { date: '07/08', revenue: 5900000 },
          { date: '08/08', revenue: 6200000 },
          { date: '09/08', revenue: 5700000 },
          { date: '10/08', revenue: 6400000 },
          { date: '11/08', revenue: 7200000 },
          { date: '12/08', revenue: 8100000 },
          { date: '13/08', revenue: 7500000 },
          { date: '14/08', revenue: 6900000 },
          { date: '15/08', revenue: 7800000 },
        ],
      };
      
      setDashboardData(simulatedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-main">
        <DashboardHeader toggleSidebar={toggleSidebar} />
        
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <h1>Dashboard</h1>
            <p>Welcome to your store analytics dashboard</p>
          </div>
          
          <SummaryCards data={dashboardData} />
          
          <div className="dashboard-charts-container">
            <div className="dashboard-section">
              <div className="section-header">
                <h3>Revenue Overview</h3>
                <div className="period-selector">
                  <select 
                    value={revenuePeriod} 
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                    className="period-select"
                  >
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                </div>
              </div>
              <RevenueChart period={revenuePeriod} />
            </div>
            
            <div className="dashboard-quick-stats">
              <div className="quick-stat-card">
                <h3>Inventory Status</h3>
                <div className="inventory-stats">
                  <div className="inventory-stat-item">
                    <span className="stat-value">{dashboardData.inventory.totalProducts}</span>
                    <span className="stat-label">Total Products</span>
                  </div>
                  <div className="inventory-stat-item">
                    <span className="stat-value">{dashboardData.inventory.lowStock}</span>
                    <span className="stat-label">Low Stock</span>
                  </div>
                  <div className="inventory-stat-item">
                    <span className="stat-value">{dashboardData.inventory.outOfStock}</span>
                    <span className="stat-label">Out of Stock</span>
                  </div>
                </div>
                <Link to="/dashboard/inventory" className="view-inventory">
                  View Inventory Report
                </Link>
              </div>
              
              <div className="quick-stat-card">
                <h3>Customer Visits</h3>
                <div className="customer-stats">
                  <div className="customer-stat-item">
                    <span className="stat-value">{dashboardData.today.visitors}</span>
                    <span className="stat-label">Today</span>
                  </div>
                  <div className="customer-stat-item">
                    <span className="stat-value">{dashboardData.month.visitors}</span>
                    <span className="stat-label">This Month</span>
                  </div>
                </div>
                <Link to="/dashboard/customers" className="view-customers">
                  View Customer Analytics
                </Link>
              </div>
            </div>
          </div>
          
          <div className="dashboard-tables-container">
            <div className="dashboard-top-products">
              <div className="table-header">
                <h2>Top Selling Products</h2>
                <Link to="/dashboard/sales-performance" className="view-details">
                  View All
                </Link>
              </div>
              <TopProducts products={dashboardData.topProducts} />
            </div>
            
            <div className="dashboard-recent-orders">
              <div className="table-header">
                <h2>Recent Orders</h2>
                <Link to="/orders" className="view-details">
                  View All
                </Link>
              </div>
              <RecentOrders orders={dashboardData.recentOrders} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 