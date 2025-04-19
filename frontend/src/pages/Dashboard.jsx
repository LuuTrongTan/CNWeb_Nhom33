import React from 'react';
import '../styles/css/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Xin chào, Khách hàng!</h1>
          <p>Chào mừng bạn quay trở lại với ZIRA Fashion.</p>
        </div>
        <div className="action-buttons">
          <button className="btn-new">
            <i className="fa-solid fa-plus"></i> Đơn hàng mới
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { title: 'Sản phẩm đang theo dõi', count: 12, icon: 'fa-heart', color: '#ff6b6b' },
          { title: 'Đơn hàng đang giao', count: 3, icon: 'fa-truck', color: '#4a90e2' },
          { title: 'Đánh giá của bạn', count: 8, icon: 'fa-star', color: '#feca57' },
          { title: 'Điểm tích lũy', count: 1250, icon: 'fa-gift', color: '#1dd1a1' },
        ].map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <h3>{stat.count}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="grid-item recent-orders">
          <div className="section-header">
            <h2>Đơn hàng gần đây</h2>
            <a href="/orders">Xem tất cả</a>
          </div>
          <div className="orders-list">
            {[
              { id: 'ZR1023', date: '15/05/2023', status: 'Đang giao', total: '1.250.000 ₫' },
              { id: 'ZR1022', date: '10/05/2023', status: 'Hoàn thành', total: '850.000 ₫' },
              { id: 'ZR1021', date: '05/05/2023', status: 'Hoàn thành', total: '1.650.000 ₫' },
            ].map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-info">
                  <h4>{order.id}</h4>
                  <p>{order.date}</p>
                </div>
                <div className="order-status">
                  <span className={`status ${order.status === 'Đang giao' ? 'pending' : 'completed'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-total">{order.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-item trending-products">
          <div className="section-header">
            <h2>Sản phẩm thịnh hành</h2>
            <a href="/products">Xem tất cả</a>
          </div>
          <div className="product-grid">
            {[
              { name: 'Áo Thun Basic', price: '250.000 ₫', sold: 124 },
              { name: 'Quần Jeans Slim Fit', price: '550.000 ₫', sold: 98 },
              { name: 'Áo Khoác Bomber', price: '750.000 ₫', sold: 87 },
              { name: 'Váy Liền Thân', price: '450.000 ₫', sold: 76 },
            ].map((product, index) => (
              <div className="product-card" key={index}>
                <div className="product-name">{product.name}</div>
                <div className="product-details">
                  <span className="product-price">{product.price}</span>
                  <span className="product-sold">{product.sold} đã bán</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="promotion-banner">
        <div className="banner-content">
          <h2>Ưu đãi mùa hè</h2>
          <p>Giảm đến 50% cho tất cả sản phẩm mùa hè</p>
          <button className="banner-button">Mua ngay</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 