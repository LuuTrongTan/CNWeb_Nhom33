import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getProductsByCategory, getProductFilter } from '../service/productAPI';
import { getAllCategory } from '../service/categoryAPI';
import { useCart } from '../context/CartContext';
import '../styles/css/CategoryPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faSort, faChevronDown, faChevronUp, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const CategoryPage = () => {
  const { pathname } = useLocation();
  const categoryPath = pathname.split('/')[1]; // Lấy phần đầu tiên của đường dẫn (ví dụ: 'nu', 'nam', 'tre-em')
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const { addToCart } = useCart();

  // Các state cho bộ lọc
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('-createdAt'); // Mặc định sắp xếp theo ngày tạo mới nhất
  
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Đen', 'Trắng', 'Đỏ', 'Xanh Navy', 'Xanh Lá', 'Vàng', 'Xám'];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategory();
        setCategories(data);
        
        // Tìm category ID dựa trên pathname
        let categoryId = null;
        if (categoryPath) {
          const matchedCategory = data.find(cat => {
            const catNameSlug = cat.name.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return catNameSlug === categoryPath;
          });
          
          if (matchedCategory) {
            categoryId = matchedCategory._id;
            setSelectedCategory(matchedCategory);
          }
        }
        
        if (categoryId) {
          fetchProductsByCategory(categoryId);
        } else {
          // Fallback: sử dụng bộ lọc sản phẩm nếu không tìm thấy danh mục
          fetchFilteredProducts();
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
        setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchCategories();
    
    // Cuộn trang lên đầu khi component được mount
    window.scrollTo(0, 0);
  }, [categoryPath]);

  const fetchProductsByCategory = async (categoryId, page = 1) => {
    setLoading(true);
    try {
      const response = await getProductsByCategory(categoryId, page);
      setProducts(response.data);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm theo danh mục:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductFilter(
        selectedColors.length > 0 ? selectedColors : null,
        selectedCategory ? selectedCategory._id : null,
        selectedSizes.length > 0 ? selectedSizes : null,
        currentPage.toString()
      );
      
      setProducts(response.docs || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.totalDocs || 0);
    } catch (err) {
      console.error("Lỗi khi lấy sản phẩm có bộ lọc:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchFilteredProducts();
    }
  }, [selectedCategory, selectedColors, selectedSizes, currentPage, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = Number(value);
    setPriceRange(newRange);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 2000000]);
    setCurrentPage(1);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      pages.push(
        <button key="first" onClick={() => handlePageChange(1)} className="pagination-button">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)} 
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button key="last" onClick={() => handlePageChange(totalPages)} className="pagination-button">
          {totalPages}
        </button>
      );
    }
    
    return (
      <div className="pagination">
        <button 
          className="pagination-button"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {pages}
        <button 
          className="pagination-button"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Đã xảy ra lỗi!</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-banner">
        <h1>{selectedCategory ? selectedCategory.name : 'Tất cả sản phẩm'}</h1>
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / 
          {selectedCategory ? (
            <span>{selectedCategory.name}</span>
          ) : (
            <span>Sản phẩm</span>
          )}
        </div>
      </div>
      
      <div className="category-content">
        <button className="filter-toggle-button" onClick={toggleFilter}>
          <FontAwesomeIcon icon={faFilter} /> Bộ lọc
        </button>
        
        <div className={`filter-sidebar ${showFilter ? 'show' : ''}`}>
          <div className="filter-header">
            <h2>Bộ lọc</h2>
            <button className="close-filter" onClick={toggleFilter}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="filter-section">
            <h3>Danh mục</h3>
            <ul className="category-list">
              {categories.map(category => (
                <li key={category._id}>
                  <button 
                    className={`category-button ${selectedCategory && selectedCategory._id === category._id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="filter-section">
            <h3>Kích thước</h3>
            <div className="size-filters">
              {sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-filter ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Màu sắc</h3>
            <div className="color-filters">
              {colors.map(color => (
                <button 
                  key={color} 
                  className={`color-filter ${selectedColors.includes(color) ? 'active' : ''}`}
                  onClick={() => handleColorToggle(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Giá</h3>
            <div className="price-range-inputs">
              <input 
                type="number" 
                value={priceRange[0]} 
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                min="0"
                step="100000"
              />
              <span>-</span>
              <input 
                type="number" 
                value={priceRange[1]} 
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                min={priceRange[0]}
                step="100000"
              />
            </div>
            <div className="price-range-slider">
              <input 
                type="range" 
                min="0" 
                max="2000000" 
                value={priceRange[0]} 
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                step="100000"
              />
              <input 
                type="range" 
                min="0" 
                max="2000000" 
                value={priceRange[1]} 
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                step="100000"
              />
            </div>
          </div>
          
          <button className="clear-filters-button" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        </div>
        
        <div className="products-container">
          <div className="products-header">
            <div className="products-count">
              Hiển thị {products.length} trên {totalProducts} sản phẩm
            </div>
            <div className="products-sort">
              <label>Sắp xếp:</label>
              <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                <option value="-createdAt">Mới nhất</option>
                <option value="price">Giá: Thấp đến cao</option>
                <option value="-price">Giá: Cao đến thấp</option>
                <option value="-rating">Đánh giá</option>
              </select>
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="no-products">
              <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
              <button className="clear-filters-button" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div className="product-card" key={product._id}>
                  <Link to={`/products/${product._id}`} className="product-image">
                    <img 
                      src={product.images && product.images.length > 0 
                        ? product.images[0]
                        : 'https://picsum.photos/seed/product/300/400'
                      } 
                      alt={product.name} 
                    />
                    {product.discountPercentage > 0 && (
                      <span className="discount-badge">-{product.discountPercentage}%</span>
                    )}
                  </Link>
                  <div className="product-info">
                    <h3 className="product-name">
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </h3>
                    <div className="product-price">
                      {product.salePrice ? (
                        <>
                          <span className="sale-price">{product.salePrice.toLocaleString()}đ</span>
                          <span className="original-price">{product.price.toLocaleString()}đ</span>
                        </>
                      ) : (
                        <span className="regular-price">{product.price.toLocaleString()}đ</span>
                      )}
                    </div>
                    <button 
                      className="add-to-cart-button"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 