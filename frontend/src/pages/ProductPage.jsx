import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faHome,
  faChevronRight,
  faSort,
  faSearch,
  faTh,
  faList
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import ProductCard from '../components/Product/ProductCard';
import '../styles/css/ProductList.css';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'shirt', name: 'Áo' },
    { id: 'pants', name: 'Quần' },
    { id: 'shoes', name: 'Giày' }
  ];
  
  const priceRanges = [
    { id: 'all', name: 'Tất cả giá' },
    { id: 'under-200', name: 'Dưới 200.000đ' },
    { id: '200-400', name: '200.000đ - 400.000đ' },
    { id: 'over-400', name: 'Trên 400.000đ' }
  ];
  
  const sortOptions = [
    { id: 'featured', name: 'Nổi bật' },
    { id: 'newest', name: 'Mới nhất' },
    { id: 'price-asc', name: 'Giá tăng dần' },
    { id: 'price-desc', name: 'Giá giảm dần' }
  ];
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Trong môi trường thực tế, đây sẽ là một API call đến backend
        // const response = await axios.get('/api/products');
        // setProducts(response.data);
        
        // Sử dụng dữ liệu mẫu từ products.js
        const module = await import('../data/products');
        setTimeout(() => {
          setProducts(module.default);
          setLoading(false);
        }, 500); // Giả lập thời gian tải
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu sản phẩm');
        setLoading(false);
        console.error('Lỗi khi tải sản phẩm:', err);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Lọc sản phẩm theo danh mục
  const filterByCategory = (product) => {
    if (!categoryFilter || categoryFilter === 'all') return true;
    
    // Giả sử các sản phẩm có thể phân loại bằng tên
    if (categoryFilter === 'shirt' && product.name.includes('Áo')) return true;
    if (categoryFilter === 'pants' && product.name.includes('Quần')) return true;
    if (categoryFilter === 'shoes' && product.name.includes('Giày')) return true;
    
    return false;
  };
  
  // Lọc sản phẩm theo khoảng giá
  const filterByPriceRange = (product) => {
    if (!priceRangeFilter || priceRangeFilter === 'all') return true;
    
    if (priceRangeFilter === 'under-200' && product.price < 200000) return true;
    if (priceRangeFilter === '200-400' && product.price >= 200000 && product.price <= 400000) return true;
    if (priceRangeFilter === 'over-400' && product.price > 400000) return true;
    
    return false;
  };
  
  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filterBySearchTerm = (product) => {
    if (!searchTerm) return true;
    
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  };
  
  // Sắp xếp sản phẩm
  const sortProducts = (a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.id) - new Date(a.id); // Giả sử id có thể dùng làm mốc thời gian
    
    // Mặc định: nổi bật
    return a.id - b.id;
  };
  
  // Lọc và sắp xếp sản phẩm
  const filteredProducts = products
    .filter(filterByCategory)
    .filter(filterByPriceRange)
    .filter(filterBySearchTerm)
    .sort(sortProducts);
  
  // Phân trang
  const productsPerPage = 8;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Tạo mảng trang cho phân trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Reset filter khi đổi danh mục
  const handleCategoryChange = (categoryId) => {
    setCategoryFilter(categoryId);
    setShowCategoryFilter(false);
    setCurrentPage(1);
  };
  
  // Đóng các dropdown khác khi mở một dropdown
  const handleFilterClick = (filterType) => {
    if (filterType === 'category') {
      setShowCategoryFilter(!showCategoryFilter);
      setShowPriceFilter(false);
      setShowSortFilter(false);
    } else if (filterType === 'price') {
      setShowPriceFilter(!showPriceFilter);
      setShowCategoryFilter(false);
      setShowSortFilter(false);
    } else if (filterType === 'sort') {
      setShowSortFilter(!showSortFilter);
      setShowCategoryFilter(false);
      setShowPriceFilter(false);
    }
  };
  
  // Click bên ngoài dropdown để đóng nó
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        setShowCategoryFilter(false);
        setShowPriceFilter(false);
        setShowSortFilter(false);
      }
    };
    
    document.addEventListener('mousedown', closeDropdowns);
    return () => document.removeEventListener('mousedown', closeDropdowns);
  }, []);
  
  // Render trạng thái loading
  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }
  
  // Render lỗi nếu có
  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="products-page">
      <div className="products-header">
        <div className="breadcrumb">
          <div className="breadcrumb-item">
            <Link to="/">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
          <span className="breadcrumb-separator">
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
          <div className="breadcrumb-item active">Sản phẩm</div>
        </div>
        
        <h1 className="products-title">Sản phẩm</h1>
        <p className="products-description">
          Khám phá bộ sưu tập sản phẩm mới nhất với chất lượng và giá cả hợp lý
        </p>
      </div>
      
      <div className="search-filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        
        <div className="view-options">
          <button 
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FontAwesomeIcon icon={faTh} />
          </button>
          <button 
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>
      
      <div className="filter-controls">
        <div className="filters-wrapper">
          <div className="filter-dropdown">
            <button 
              className="filter-button" 
              onClick={() => handleFilterClick('category')}
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Danh mục</span>
              <FontAwesomeIcon icon={faChevronRight} className="dropdown-icon" />
            </button>
            
            {showCategoryFilter && (
              <div className="filter-menu">
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className={`filter-menu-item ${categoryFilter === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="filter-dropdown">
            <button 
              className="filter-button" 
              onClick={() => handleFilterClick('price')}
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>Giá</span>
              <FontAwesomeIcon icon={faChevronRight} className="dropdown-icon" />
            </button>
            
            {showPriceFilter && (
              <div className="filter-menu">
                {priceRanges.map(range => (
                  <div 
                    key={range.id}
                    className={`filter-menu-item ${priceRangeFilter === range.id ? 'active' : ''}`}
                    onClick={() => {
                      setPriceRangeFilter(range.id);
                      setShowPriceFilter(false);
                      setCurrentPage(1);
                    }}
                  >
                    {range.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sort-options">
          <span className="sort-label">Sắp xếp theo:</span>
          <div className="filter-dropdown">
            <button 
              className="filter-button" 
              onClick={() => handleFilterClick('sort')}
            >
              <FontAwesomeIcon icon={faSort} />
              <span>{sortOptions.find(option => option.id === sortBy)?.name || 'Nổi bật'}</span>
              <FontAwesomeIcon icon={faChevronRight} className="dropdown-icon" />
            </button>
            
            {showSortFilter && (
              <div className="filter-menu">
                {sortOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`filter-menu-item ${sortBy === option.id ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortFilter(false);
                    }}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <h2 className="empty-state-title">Không tìm thấy sản phẩm</h2>
          <p className="empty-state-message">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với các bộ lọc khác.
          </p>
          <button 
            className="empty-state-button"
            onClick={() => {
              setCategoryFilter('');
              setPriceRangeFilter('');
              setSearchTerm('');
              setSortBy('featured');
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className={`products-${viewMode}`}>
          {currentProducts.map(product => (
            <ProductCard key={product.id} product={{
              _id: product.id,
              name: product.name,
              price: product.price,
              images: [product.image],
              category: product.name.includes('Áo') ? 'Áo' : 
                      product.name.includes('Quần') ? 'Quần' : 
                      product.name.includes('Giày') ? 'Giày' : 'Thời trang',
              isNew: product.id % 3 === 0,
              discount: product.id % 2 === 0 ? 20 : 0
            }} />
          ))}
        </div>
      )}
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pagination">
          <ul className="pagination-list">
            {pageNumbers.map(number => (
              <li key={number} className="pagination-item">
                <button 
                  className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage(number);
                    window.scrollTo({top: 0, behavior: 'smooth'});
                  }}
                >
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductPage;