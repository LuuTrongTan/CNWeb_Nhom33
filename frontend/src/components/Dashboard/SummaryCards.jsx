import React from 'react';
import './SummaryCards.css';

const SummaryCards = ({ data }) => {
  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="summary-cards">
      <div className="summary-card revenue">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.5-6H14a.5.5 0 1 0 0-1h-4a2.5 2.5 0 1 1 0-5h1V6h2v2h2.5v2H10a.5.5 0 1 0 0 1h4a2.5 2.5 0 1 1 0 5h-1v2h-2v-2H8.5v-2z" />
          </svg>
        </div>
        <div className="card-content">
          <h3>Today's Revenue</h3>
          <p className="card-value">{formatCurrency(data.today.revenue)}</p>
          <p className="card-comparison">
            <span className="comparison-label">This Month:</span>
            <span className="comparison-value">{formatCurrency(data.month.revenue)}</span>
          </p>
        </div>
      </div>

      <div className="summary-card orders">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M4 6.414L.757 3.172l1.415-1.415L5.414 5h15.242a1 1 0 0 1 .958 1.287l-2.4 8a1 1 0 0 1-.958.713H6v2h11v2H5a1 1 0 0 1-1-1V6.414zM6 7v6h11.512l1.8-6H6zm-.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </div>
        <div className="card-content">
          <h3>Today's Orders</h3>
          <p className="card-value">{data.today.orders}</p>
          <p className="card-comparison">
            <span className="comparison-label">This Month:</span>
            <span className="comparison-value">{data.month.orders}</span>
          </p>
        </div>
      </div>

      <div className="summary-card visitors">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M2 22a8 8 0 1 1 16 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm10 4h4v2h-4v-2zm-3-5h7v2h-7v-2zm2-5h5v2h-5V7z" />
          </svg>
        </div>
        <div className="card-content">
          <h3>Today's Visitors</h3>
          <p className="card-value">{data.today.visitors}</p>
          <p className="card-comparison">
            <span className="comparison-label">This Month:</span>
            <span className="comparison-value">{data.month.visitors}</span>
          </p>
        </div>
      </div>

      <div className="summary-card inventory">
        <div className="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M20 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h16zm-1 2H5v14h14V5zM9 9V7h2v2h2v2h-2v2H9v-2H7V9h2z" />
          </svg>
        </div>
        <div className="card-content">
          <h3>Inventory Status</h3>
          <p className="card-value">{data.inventory.totalProducts} Products</p>
          <div className="inventory-alert">
            <span className={`alert-badge ${data.inventory.lowStock > 0 ? 'warning' : ''}`}>
              {data.inventory.lowStock} Low Stock
            </span>
            <span className={`alert-badge ${data.inventory.outOfStock > 0 ? 'danger' : ''}`}>
              {data.inventory.outOfStock} Out of Stock
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards; 