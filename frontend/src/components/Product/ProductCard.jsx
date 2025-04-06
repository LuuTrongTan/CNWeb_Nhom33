import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { id, name, price, image, category, isNew, discount } = product;
  const discountedPrice = discount > 0 ? price - (price * discount / 100) : price;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${id}`}>
          <img src={image} alt={name} className="product-image" />
        </Link>
        
        {isNew && <span className="product-badge new-badge">New</span>}
        {discount > 0 && <span className="product-badge discount-badge">-{discount}%</span>}
        
        <div className="product-actions">
          <button className="action-button wishlist-button" title="Add to wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button className="action-button cart-button" title="Add to cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
          <button className="action-button quickview-button" title="Quick view">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <Link to={`/product/${id}`} className="product-name">{name}</Link>
        <p className="product-category">{category}</p>
        <div className="product-price">
          {discount > 0 && <span className="original-price">{price.toLocaleString('vi-VN')}đ</span>}
          <span className="current-price">{discountedPrice.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 