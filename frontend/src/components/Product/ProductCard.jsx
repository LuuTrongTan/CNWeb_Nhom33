import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faShoppingCart, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import '../../styles/css/ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, images, category, isNew, discount } = product;
  const discountedPrice = discount > 0 ? price - (price * discount / 100) : price;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || !_id) return;
        
        setIsLoadingWishlist(true);
        const response = await axios.get(`/wishlist/${_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setIsInWishlist(response.data.isInWishlist);
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái yêu thích:', err);
      } finally {
        setIsLoadingWishlist(false);
      }
    };
    
    checkWishlistStatus();
  }, [_id]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
        return;
      }
      
      setIsLoadingWishlist(true);
      
      if (isInWishlist) {
        // Xóa khỏi wishlist
        await axios.delete(`/wishlist/${_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsInWishlist(false);
      } else {
        // Thêm vào wishlist
        await axios.post('/wishlist', 
          { productId: _id },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật danh sách yêu thích:', err);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: _id,
      name,
      price,
      image: images[0],
      quantity: 1
    });
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/products/${_id}`}>
          <img src={images[0]} alt={name} className="product-image" />
        </Link>
        
        {isNew && <span className="product-badge new-badge">New</span>}
        {discount > 0 && <span className="product-badge discount-badge">-{discount}%</span>}
        
        <div className="product-actions">
          <button 
            className={`action-button wishlist-button ${isInWishlist ? 'active' : ''}`} 
            title={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            onClick={handleToggleWishlist}
            disabled={isLoadingWishlist}
          >
            <FontAwesomeIcon icon={isInWishlist ? solidHeart : regularHeart} />
          </button>
          <button 
            className="action-button cart-button" 
            title="Thêm vào giỏ hàng"
            onClick={handleAddToCart}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
          </button>
          <Link 
            to={`/products/${_id}`} 
            className="action-button quickview-button" 
            title="Xem chi tiết"
          >
            <FontAwesomeIcon icon={faEye} />
          </Link>
        </div>
      </div>
      
      <div className="product-info">
        <Link to={`/products/${_id}`} className="product-name">{name}</Link>
        <p className="product-category">{category?.name || category}</p>
        <div className="product-price">
          {discount > 0 && <span className="original-price">{price.toLocaleString('vi-VN')}đ</span>}
          <span className="current-price">{discountedPrice.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 