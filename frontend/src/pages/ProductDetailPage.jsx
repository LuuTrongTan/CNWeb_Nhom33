import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRelatedProducts } from '../service/productAPI';
import { useCart } from '../context/CartContext';
import '../styles/css/ProductDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart, faArrowLeft, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import ReviewList from '../components/Review/ReviewList';
import ReviewForm from '../components/Review/ReviewForm';
import axios from 'axios';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        
        // Lấy sản phẩm liên quan sau khi có thông tin sản phẩm
        try {
          const relatedData = await getRelatedProducts(id);
          setRelatedProducts(relatedData);
        } catch (err) {
          console.error('Lỗi khi lấy sản phẩm liên quan:', err);
          // Không báo lỗi chính vì đây chỉ là tính năng phụ
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
    
    // Cuộn trang lên đầu khi component được mount
    window.scrollTo(0, 0);
  }, [id]);

  // Hàm tạm thời để hiển thị dữ liệu giả trong trường hợp API chưa hoạt động
  useEffect(() => {
    if (loading && !error) {
      // Mock data nếu API chưa hoạt động
      const mockProduct = {
        id: id,
        name: 'Áo Thun Basic Form Rộng',
        price: 350000,
        salePrice: 280000,
        discount: 20,
        description: 'Áo thun basic form rộng, chất liệu cotton 100%, mềm mại và thoáng khí. Phù hợp cho cả nam và nữ, dễ dàng kết hợp với nhiều trang phục khác nhau.',
        colors: ['Đen', 'Trắng', 'Xám', 'Xanh Navy'],
        sizes: ['S', 'M', 'L', 'XL'],
        images: [
          'https://picsum.photos/seed/product1/600/800',
          'https://picsum.photos/seed/product2/600/800',
          'https://picsum.photos/seed/product3/600/800',
          'https://picsum.photos/seed/product4/600/800',
        ],
        mainImage: 'https://picsum.photos/seed/product1/600/800',
        rating: 4.5,
        reviews: 124,
        sku: 'AT-BASIC-001',
        category: 'Áo thun',
        tags: ['basic', 'unisex', 'cotton', 'oversized'],
        inStock: true,
        material: '100% Cotton',
        care: 'Giặt máy ở nhiệt độ thấp, không tẩy, là ở nhiệt độ trung bình',
      };
      
      const mockRelatedProducts = [
        { _id: '101', name: 'Áo Thun Graphic', price: 380000, images: ['https://picsum.photos/seed/related1/300/400'] },
        { _id: '102', name: 'Áo Polo Basic', price: 420000, images: ['https://picsum.photos/seed/related2/300/400'] },
        { _id: '103', name: 'Áo Thun Kẻ Sọc', price: 360000, images: ['https://picsum.photos/seed/related3/300/400'] },
        { _id: '104', name: 'Áo Thun Logo', price: 340000, images: ['https://picsum.photos/seed/related4/300/400'] },
      ];
      
      setTimeout(() => {
        setProduct(mockProduct);
        setRelatedProducts(mockRelatedProducts);
        setLoading(false);
      }, 800); // Giả lập thời gian tải
    }
  }, [id, loading, error]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || !id) return;
        
        setIsLoadingWishlist(true);
        const response = await axios.get(`/v1/wishlist/${id}`, {
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
  }, [id]);

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Vui lòng chọn kích thước');
      return;
    }
    
    if (!selectedColor) {
      alert('Vui lòng chọn màu sắc');
      return;
    }
    
    const productToAdd = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };
    
    addToCart(productToAdd);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleToggleWishlist = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
        return;
      }
      
      setIsLoadingWishlist(true);
      
      if (isInWishlist) {
        // Xóa khỏi wishlist
        await axios.delete(`/v1/wishlist/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setIsInWishlist(false);
      } else {
        // Thêm vào wishlist
        await axios.post('/v1/wishlist', 
          { productId: id },
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

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Đã xảy ra lỗi!</h2>
        <p>{error}</p>
        <Link to="/san-pham" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link to="/san-pham" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / 
        <Link to="/san-pham">Sản phẩm</Link> / 
        <span>{product.name}</span>
      </div>
      
      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image">
            <img src={product.mainImage || product.images[0]} alt={product.name} />
          </div>
          <div className="thumbnail-images">
            {product.images && product.images.map((image, index) => (
              <div className="thumbnail" key={index}>
                <img src={image} alt={`${product.name} - Ảnh ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          
          <div className="product-meta">
            <div className="product-rating">
              {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                  <span key={i}>
                    {ratingValue <= product.rating ? (
                      <FontAwesomeIcon icon={faStar} className="star-filled" />
                    ) : ratingValue - 0.5 <= product.rating ? (
                      <FontAwesomeIcon icon={faStarHalfAlt} className="star-filled" />
                    ) : (
                      <FontAwesomeIcon icon={faStar} className="star-empty" />
                    )}
                  </span>
                );
              })}
              <span className="review-count">({product.reviews} đánh giá)</span>
            </div>
            
            <div className="product-sku">
              <span>Mã sản phẩm:</span> {product.sku}
            </div>
          </div>
          
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="sale-price">{product.salePrice.toLocaleString()}đ</span>
                <span className="original-price">{product.price.toLocaleString()}đ</span>
                <span className="discount-badge">-{product.discount}%</span>
              </>
            ) : (
              <span className="regular-price">{product.price.toLocaleString()}đ</span>
            )}
          </div>
          
          <div className="product-short-description">
            <p>{product.description.substring(0, 150)}...</p>
          </div>
          
          <div className="product-options">
            <div className="option-section">
              <h3>Màu sắc</h3>
              <div className="color-options">
                {product.colors && product.colors.map(color => (
                  <div 
                    key={color} 
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => handleColorSelect(color)}
                  >
                    {color}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="option-section">
              <h3>Kích thước</h3>
              <div className="size-options">
                {product.sizes && product.sizes.map(size => (
                  <div 
                    key={size} 
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="quantity-selector">
              <h3>Số lượng</h3>
              <div className="quantity-control">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange('increase')}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="product-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ hàng
            </button>
            <button className={`add-to-wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`} onClick={handleToggleWishlist} disabled={isLoadingWishlist}>
              <FontAwesomeIcon icon={faHeart} /> {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
            </button>
          </div>
          
          <div className="product-meta-info">
            <div className="meta-item">
              <span className="meta-label">Danh mục:</span>
              <span className="meta-value">{product.category?.name || product.category}</span>
            </div>
            {product.tags && (
              <div className="meta-item">
                <span className="meta-label">Tags:</span>
                <span className="meta-value">
                  {product.tags.map((tag, index) => (
                    <span key={tag} className="tag">
                      {tag}{index < product.tags.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả
          </button>
          <button 
            className={`tab-header ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            Thông tin thêm
          </button>
          <button 
            className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá ({product.reviews})
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'additional' && (
            <div className="tab-panel">
              <h3>Thông tin thêm</h3>
              <table className="additional-info-table">
                <tbody>
                  <tr>
                    <th>Chất liệu</th>
                    <td>{product.material}</td>
                  </tr>
                  <tr>
                    <th>Hướng dẫn bảo quản</th>
                    <td>{product.care}</td>
                  </tr>
                  <tr>
                    <th>Tình trạng</th>
                    <td>{product.inStock ? 'Còn hàng' : 'Hết hàng'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <h3>Đánh giá từ khách hàng</h3>
              <div className="reviews-summary">
                <div className="average-rating">
                  <span className="rating-number">{product.rating}</span>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => {
                      const ratingValue = i + 1;
                      return (
                        <span key={i}>
                          {ratingValue <= product.rating ? (
                            <FontAwesomeIcon icon={faStar} className="star-filled" />
                          ) : ratingValue - 0.5 <= product.rating ? (
                            <FontAwesomeIcon icon={faStarHalfAlt} className="star-filled" />
                          ) : (
                            <FontAwesomeIcon icon={faStar} className="star-empty" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <p>Dựa trên {product.reviews} đánh giá</p>
                </div>
              </div>
              
              <ReviewList productId={id} />
              
              <ReviewForm 
                productId={id} 
                onReviewSubmitted={() => {
                  // Reload product data to update review count and rating
                  const fetchProductDetails = async () => {
                    try {
                      const data = await getProductById(id);
                      setProduct(data);
                    } catch (err) {
                      console.error('Lỗi khi cập nhật thông tin sản phẩm:', err);
                    }
                  };
                  fetchProductDetails();
                }} 
              />
            </div>
          )}
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-products-grid">
            {relatedProducts.map(relatedProduct => (
              <Link to={`/san-pham/${relatedProduct._id}`} key={relatedProduct._id} className="related-product-card">
                <div className="related-product-image">
                  <img 
                    src={relatedProduct.images && relatedProduct.images.length > 0 
                      ? relatedProduct.images[0] 
                      : 'https://picsum.photos/seed/product/300/400'
                    } 
                    alt={relatedProduct.name}
                  />
                </div>
                <div className="related-product-info">
                  <h3>{relatedProduct.name}</h3>
                  <p className="related-product-price">{relatedProduct.price.toLocaleString()}đ</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage; 