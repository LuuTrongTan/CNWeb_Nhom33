import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getWishlist, removeFromWishlist, clearWishlist } from '../../services/wishlist.service';
import '../../styles/css/WishlistPage.css'; // Import CSS từ WishlistPage

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch wishlist items on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getWishlist();
        setWishlistItems(response.products);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
        toast.error('Không thể tải danh sách yêu thích');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Handle remove item from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.product._id !== productId));
      toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error(error.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích');
    }
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
      try {
        await clearWishlist();
        setWishlistItems([]);
        toast.success('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error(error.message || 'Không thể xóa danh sách yêu thích');
      }
    }
  };

  if (isLoading) {
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
        {wishlistItems.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="clear-wishlist-btn"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <p>Danh sách yêu thích của bạn đang trống</p>
          <Link to="/products" className="shop-now-btn">Mua sắm ngay</Link>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div className="wishlist-item" key={item._id}>
                <div className="item-image">
                  <Link to={`/products/${item.product._id}`}>
                    {item.product.images && item.product.images.length > 0 ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                      />
                    ) : (
                      <div className="no-image">Không có ảnh</div>
                    )}
                  </Link>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.product._id)}
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <div className="item-details">
                  <h3 className="item-name">
                    <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                  </h3>
                  <div className="item-price">
                    {item.product.discount > 0 ? (
                      <>
                        <span className="discounted-price">
                          {(item.product.price - (item.product.price * item.product.discount / 100)).toLocaleString()}đ
                        </span>
                        <span className="original-price">
                          {item.product.price.toLocaleString()}đ
                        </span>
                      </>
                    ) : (
                      <span className="current-price">{item.product.price.toLocaleString()}đ</span>
                    )}
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => navigate(`/products/${item.product._id}`)}
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
        </>
      )}
    </div>
  );
};

export default Wishlist; 