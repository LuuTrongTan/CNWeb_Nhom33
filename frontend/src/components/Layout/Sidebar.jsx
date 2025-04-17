import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/css/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [expandedFilters, setExpandedFilters] = useState({
    'size': true,
    'color': true,
    'price': true,
    'categories': true
  });

  const categories = [
    {
      id: 'women',
      label: 'Nữ',
      icon: 'fa-solid fa-venus',
      path: '/nu',
      subcategories: [
        { name: 'Áo thun', path: '/nu/ao-thun' },
        { name: 'Áo sơ mi', path: '/nu/ao-so-mi' },
        { name: 'Quần jeans', path: '/nu/quan-jeans' },
        { name: 'Váy', path: '/nu/vay' },
      ]
    },
    {
      id: 'men',
      label: 'Nam',
      icon: 'fa-solid fa-mars',
      path: '/nam',
      subcategories: [
        { name: 'Áo thun', path: '/nam/ao-thun' },
        { name: 'Áo sơ mi', path: '/nam/ao-so-mi' },
        { name: 'Quần jeans', path: '/nam/quan-jeans' },
        { name: 'Quần short', path: '/nam/quan-short' },
      ]
    },
    {
      id: 'kids',
      label: 'Trẻ em',
      icon: 'fa-solid fa-child',
      path: '/tre-em',
      subcategories: [
        { name: 'Bé trai', path: '/tre-em/be-trai' },
        { name: 'Bé gái', path: '/tre-em/be-gai' },
      ]
    },
    {
      id: 'accessories',
      label: 'Phụ kiện',
      icon: 'fa-solid fa-gem',
      path: '/phu-kien',
      subcategories: [
        { name: 'Túi xách', path: '/phu-kien/tui-xach' },
        { name: 'Trang sức', path: '/phu-kien/trang-suc' },
        { name: 'Mũ & Nón', path: '/phu-kien/mu-non' },
        { name: 'Thắt lưng', path: '/phu-kien/that-lung' },
      ]
    },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Đen', code: '#000000' },
    { name: 'Trắng', code: '#FFFFFF' },
    { name: 'Đỏ', code: '#FF0000' },
    { name: 'Xanh dương', code: '#0000FF' },
    { name: 'Xanh lá', code: '#00FF00' },
    { name: 'Vàng', code: '#FFFF00' },
    { name: 'Hồng', code: '#FFC0CB' },
    { name: 'Xám', code: '#808080' },
  ];

  const priceRanges = [
    { label: 'Dưới 200.000đ', value: 'under-200k' },
    { label: '200.000đ - 500.000đ', value: '200k-500k' },
    { label: '500.000đ - 1.000.000đ', value: '500k-1m' },
    { label: 'Trên 1.000.000đ', value: 'over-1m' },
  ];

  const toggleFilter = (filterId) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  return (
    <div className="sidebar">
      {/* Danh mục sản phẩm */}
      <div className="sidebar-section">
        <h3 
          className="sidebar-title"
          onClick={() => toggleFilter('categories')}
        >
          Danh mục sản phẩm
          <i className={`fa-solid fa-chevron-${expandedFilters['categories'] ? 'up' : 'down'}`}></i>
        </h3>
        <div className={`sidebar-content ${expandedFilters['categories'] ? 'expanded' : ''}`}>
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id} className={location.pathname.startsWith(category.path) ? 'active' : ''}>
                <Link to={category.path} className="category-link">
                  <i className={category.icon}></i>
                  <span>{category.label}</span>
                </Link>
                <ul className="subcategory-list">
                  {category.subcategories.map((subcategory, index) => (
                    <li key={index} className={location.pathname === subcategory.path ? 'active' : ''}>
                      <Link to={subcategory.path}>{subcategory.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lọc theo kích thước */}
      <div className="sidebar-section">
        <h3 
          className="sidebar-title"
          onClick={() => toggleFilter('size')}
        >
          Kích thước
          <i className={`fa-solid fa-chevron-${expandedFilters['size'] ? 'up' : 'down'}`}></i>
        </h3>
        <div className={`sidebar-content ${expandedFilters['size'] ? 'expanded' : ''}`}>
          <div className="size-options">
            {sizes.map((size, index) => (
              <label key={index} className="size-option">
                <input type="checkbox" name="size" value={size} />
                <span className="size-checkbox">{size}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Lọc theo màu sắc */}
      <div className="sidebar-section">
        <h3 
          className="sidebar-title"
          onClick={() => toggleFilter('color')}
        >
          Màu sắc
          <i className={`fa-solid fa-chevron-${expandedFilters['color'] ? 'up' : 'down'}`}></i>
        </h3>
        <div className={`sidebar-content ${expandedFilters['color'] ? 'expanded' : ''}`}>
          <div className="color-options">
            {colors.map((color, index) => (
              <label key={index} className="color-option">
                <input type="checkbox" name="color" value={color.name} />
                <span className="color-checkbox" style={{ backgroundColor: color.code }}>
                  <i className="fa-solid fa-check"></i>
                </span>
                <span className="color-name">{color.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Lọc theo giá */}
      <div className="sidebar-section">
        <h3 
          className="sidebar-title"
          onClick={() => toggleFilter('price')}
        >
          Giá
          <i className={`fa-solid fa-chevron-${expandedFilters['price'] ? 'up' : 'down'}`}></i>
        </h3>
        <div className={`sidebar-content ${expandedFilters['price'] ? 'expanded' : ''}`}>
          <div className="price-options">
            {priceRanges.map((range, index) => (
              <label key={index} className="filter-option">
                <input type="checkbox" name="price" value={range.value} />
                <span className="checkmark"></span>
                <span className="option-label">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Banner khuyến mãi */}
      <div className="sidebar-banner">
        <img src="https://picsum.photos/seed/sale/300/200" alt="Khuyến mãi" />
        <div className="banner-content">
          <h3>Giảm 30%</h3>
          <p>Cho đơn hàng đầu tiên</p>
          <Link to="/sale" className="banner-btn">Mua ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
