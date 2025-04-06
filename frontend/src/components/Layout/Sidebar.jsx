import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const categories = [
    {
      name: 'Men',
      subcategories: ['T-shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Underwear', 'Activewear']
    },
    {
      name: 'Women',
      subcategories: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Jackets', 'Hoodies', 'Underwear', 'Activewear']
    },
    {
      name: 'Kids',
      subcategories: ['Boys', 'Girls', 'Toddlers', 'Babies', 'School Uniforms']
    },
    {
      name: 'Accessories',
      subcategories: ['Bags', 'Wallets', 'Belts', 'Hats', 'Scarves', 'Jewelry', 'Sunglasses']
    },
    {
      name: 'Footwear',
      subcategories: ['Sneakers', 'Casual Shoes', 'Formal Shoes', 'Sandals', 'Boots']
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="sidebar-title">Categories</div>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <div className="category-header">
                <Link to={`/category/${category.name.toLowerCase()}`} className="category-name">
                  {category.name}
                </Link>
                <span className="category-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
              <ul className="subcategory-list">
                {category.subcategories.map((subcategory, subIndex) => (
                  <li key={subIndex} className="subcategory-item">
                    <Link to={`/category/${category.name.toLowerCase()}/${subcategory.toLowerCase().replace(' ', '-')}`}>
                      {subcategory}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-divider"></div>

        <div className="sidebar-links">
          <Link to="/sale" className="sidebar-link highlight">Sale</Link>
          <Link to="/new-arrivals" className="sidebar-link highlight">New Arrivals</Link>
          <Link to="/trending" className="sidebar-link">Trending</Link>
          <Link to="/bestsellers" className="sidebar-link">Bestsellers</Link>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-footer">
          <div className="customer-service">
            <h3>Customer Service</h3>
            <p className="service-phone">+84 123 456 789</p>
            <p className="service-email">support@styleshop.com</p>
            <p className="service-hours">Mon-Fri: 9:00 - 18:00</p>
          </div>

          <div className="sidebar-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="sidebar-overlay" onClick={onClose}></div>
    </div>
  );
};

export default Sidebar; 