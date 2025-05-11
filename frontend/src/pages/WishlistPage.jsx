import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import '../styles/css/WishlistPage.css';
import AddToCartModal from '../components/Product/AddToCartModal';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem danh sách yêu thích');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setWishlistItems(response.data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:', err);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (productToAdd) => {
    addToCart(productToAdd);
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-error">
        <p>{error}</p>
        <Link to="/login" className="login-link">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>Danh sách yêu thích</h1>
        <p>Các sản phẩm bạn đã đánh dấu yêu thích</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p>Danh sách yêu thích của bạn đang trống</p>
          <Link to="/products" className="shop-now-btn">Mua sắm ngay</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <div className="wishlist-card" key={product._id}>
                <div className="wishlist-card-image-container">
                  <Link to={`/products/${product._id}`}>
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="wishlist-card-image" 
                    />
                  </Link>
                  <button 
                    className="wishlist-card-remove-btn"
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <div className="wishlist-card-details">
                  <h3 className="wishlist-card-name">
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </h3>
                  <div className="wishlist-card-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="wishlist-card-discounted-price">
                          {(product.price - (product.price * product.discount / 100)).toLocaleString()}đ
                        </span>
                        <span className="wishlist-card-original-price">
                          {product.price.toLocaleString()}đ
                        </span>
                      </>
                    ) : (
                      <span>{product.price.toLocaleString()}đ</span>
                    )}
                  </div>
                  <button 
                    className="wishlist-card-add-to-cart-btn"
                    onClick={() => handleOpenModal(product)}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="wishlist-actions">
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Modal thêm vào giỏ hàng */}
          {selectedProduct && (
            <AddToCartModal
              product={selectedProduct}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onAddToCart={handleAddToCart}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WishlistPage;