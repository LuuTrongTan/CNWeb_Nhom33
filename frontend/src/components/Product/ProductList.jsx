import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext';
import '../../styles/css/ProductList.css';

const ProductList = () => {
  const { selectedFilter } = useContext(FilterContext);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayCount, setDisplayCount] = useState(8);
  const [sortOption, setSortOption] = useState('newest');

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Áp dụng bộ lọc khi selectedFilter thay đổi
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      // Lọc theo danh mục
      if (selectedFilter.category) {
        const [mainCategory, subCategory] = selectedFilter.category.value.split('-');
        if (subCategory) {
          filtered = filtered.filter(product => 
            product.category === mainCategory && product.subCategory === subCategory);
        } else {
          filtered = filtered.filter(product => product.category === mainCategory);
        }
      }

      // Lọc theo kích thước
      if (selectedFilter.sizes.length > 0) {
        filtered = filtered.filter(product => 
          product.variants.some(variant => 
            selectedFilter.sizes.includes(variant.size))
        );
      }

      // Lọc theo màu sắc
      if (selectedFilter.color) {
        filtered = filtered.filter(product => 
          product.variants.some(variant => 
            variant.color.toLowerCase() === selectedFilter.color.toLowerCase())
        );
      }

      // Lọc theo khoảng giá
      if (selectedFilter.price) {
        filtered = filtered.filter(product => 
          product.price >= selectedFilter.price.min && product.price <= selectedFilter.price.max
        );
      }

      // Áp dụng sắp xếp
      switch (sortOption) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      setFilteredProducts(filtered);
    }
  }, [products, selectedFilter, sortOption]);

  // Tăng số lượng sản phẩm hiển thị khi nhấn "Xem thêm"
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  // Xử lý thay đổi tùy chọn sắp xếp
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Hiển thị placeholder khi đang tải
  const renderSkeleton = () => {
    return Array(8).fill().map((_, index) => (
      <div key={index} className="product-card skeleton">
        <div className="product-image skeleton-image"></div>
        <div className="product-info">
          <div className="skeleton-title"></div>
          <div className="skeleton-price"></div>
          <div className="skeleton-rating"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="product-count">
          {loading ? (
            <span>Đang tải sản phẩm...</span>
          ) : (
            <span>{filteredProducts.length} sản phẩm</span>
          )}
        </div>
        <div className="sort-options">
          <label htmlFor="sort">Sắp xếp theo:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {loading ? (
          renderSkeleton()
        ) : filteredProducts.length > 0 ? (
          filteredProducts.slice(0, displayCount).map(product => (
            <div key={product._id} className="product-card">
              <Link to={`/product/${product._id}`} className="product-link">
                <div className="product-image">
                  <img src={product.images[0]} alt={product.name} />
                  {product.discount > 0 && (
                    <div className="product-badge">-{product.discount}%</div>
                  )}
                  <div className="product-actions">
                    <button className="quick-view-btn">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className="add-wishlist-btn">
                      <i className="fa-regular fa-heart"></i>
                    </button>
                    <button className="add-cart-btn">
                      <i className="fa-solid fa-cart-plus"></i>
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">
                          {product.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="current-price">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </>
                    ) : (
                      <span className="current-price">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                  <div className="product-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <i 
                        key={star} 
                        className={`fa-${star <= product.rating ? 'solid' : 'regular'} fa-star`}
                      ></i>
                    ))}
                    <span className="review-count">({product.reviewCount})</span>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-products">
            <i className="fa-solid fa-search"></i>
            <p>Không tìm thấy sản phẩm phù hợp với bộ lọc</p>
            <button className="reset-filter-btn" onClick={() => resetFilters()}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {filteredProducts.length > displayCount && (
        <div className="load-more">
          <button className="load-more-btn" onClick={handleLoadMore}>
            Xem thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
