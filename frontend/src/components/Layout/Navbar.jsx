import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext';
import '../../styles/css/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faUser, 
  faCog, 
  faSignOutAlt, 
  faChevronDown, 
  faTachometerAlt, 
  faBox, 
  faShoppingBag, 
  faUsers, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo.png'; // Đường dẫn đến hình ảnh logo

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { setCategoryFilter, selectedFilter } = useContext(FilterContext);
  
  const dropdownRef = useRef(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (user && token) {
        const userObj = JSON.parse(user);
        setUserData(userObj);
        setIsLoggedIn(true);
        setIsAdmin(userObj.role === 'admin');
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    checkLoginStatus();
    
    // Lắng nghe sự kiện lưu trữ thay đổi
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    setShowUserMenu(false);
    navigate('/');
  };

  // Xử lý khi click vào danh mục
  const handleCategoryClick = (category, subcategory = null) => {
    if (subcategory) {
      setCategoryFilter({ 
        name: `${category} - ${subcategory}`, 
        value: `${category}-${subcategory}`, 
        _id: `${category}-${subcategory}` 
      });
    } else {
      setCategoryFilter({ 
        name: category, 
        value: category, 
        _id: category 
      });
    }
    
    navigate('/products');
    closeMobileMenu();
  };

  // Xử lý khi submit form tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          {!isSidebarOpen && (
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
          <Link to="/" className="navbar-logo">
            <img 
              src={logo} 
              alt="Logo" 
              className="logo-image"
              style={{ backgroundColor: '#ffffff', borderRadius: '4px' }} 
            />
        </Link>
      </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <button className="close-mobile-menu" onClick={closeMobileMenu}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <ul className="nav-items">
            <li className="nav-item">
              <div 
                className={location.pathname === '/products' && selectedFilter?.category?.value?.startsWith('nu') ? 'active' : ''} 
                onClick={() => handleCategoryClick('nu')}
                style={{ cursor: 'pointer' }}
              >
                Nữ
              </div>
              <div className="dropdown-menu">
                <div className="dropdown-container">
                  <div className="dropdown-column">
                    <h4>Áo</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nu', 'ao-thun')} style={{ cursor: 'pointer' }}>Áo thun</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'ao-so-mi')} style={{ cursor: 'pointer' }}>Áo sơ mi</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'ao-khoac')} style={{ cursor: 'pointer' }}>Áo khoác</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'ao-len')} style={{ cursor: 'pointer' }}>Áo len</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Quần & Váy</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nu', 'quan-dai')} style={{ cursor: 'pointer' }}>Quần dài</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'quan-jeans')} style={{ cursor: 'pointer' }}>Quần jeans</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'vay')} style={{ cursor: 'pointer' }}>Váy</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'chan-vay')} style={{ cursor: 'pointer' }}>Chân váy</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Phụ kiện</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nu', 'tui-xach')} style={{ cursor: 'pointer' }}>Túi xách</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'giay')} style={{ cursor: 'pointer' }}>Giày</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'that-lung')} style={{ cursor: 'pointer' }}>Thắt lưng</div></li>
                      <li><div onClick={() => handleCategoryClick('nu', 'trang-suc')} style={{ cursor: 'pointer' }}>Trang sức</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column dropdown-featured">
                    <img src="https://picsum.photos/seed/women/300/400" alt="Thời trang nữ" />
                    <div className="featured-content">
                      <h4>Bộ sưu tập mới</h4>
                      <div onClick={() => handleCategoryClick('nu', 'bo-suu-tap-moi')} className="featured-link" style={{ cursor: 'pointer' }}>Khám phá ngay</div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <div 
                className={location.pathname === '/products' && selectedFilter?.category?.value?.startsWith('nam') ? 'active' : ''} 
                onClick={() => handleCategoryClick('nam')}
                style={{ cursor: 'pointer' }}
              >
                Nam
              </div>
              <div className="dropdown-menu">
                <div className="dropdown-container">
                  <div className="dropdown-column">
                    <h4>Áo</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nam', 'ao-thun')} style={{ cursor: 'pointer' }}>Áo thun</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'ao-so-mi')} style={{ cursor: 'pointer' }}>Áo sơ mi</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'ao-khoac')} style={{ cursor: 'pointer' }}>Áo khoác</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'ao-len')} style={{ cursor: 'pointer' }}>Áo len</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Quần</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nam', 'quan-dai')} style={{ cursor: 'pointer' }}>Quần dài</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'quan-jeans')} style={{ cursor: 'pointer' }}>Quần jeans</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'quan-kaki')} style={{ cursor: 'pointer' }}>Quần kaki</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'quan-short')} style={{ cursor: 'pointer' }}>Quần short</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Phụ kiện</h4>
                    <ul>
                      <li><div onClick={() => handleCategoryClick('nam', 'giay')} style={{ cursor: 'pointer' }}>Giày</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'that-lung')} style={{ cursor: 'pointer' }}>Thắt lưng</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'vi')} style={{ cursor: 'pointer' }}>Ví</div></li>
                      <li><div onClick={() => handleCategoryClick('nam', 'dong-ho')} style={{ cursor: 'pointer' }}>Đồng hồ</div></li>
                    </ul>
                  </div>
                  <div className="dropdown-column dropdown-featured">
                    <img src="https://picsum.photos/seed/men/300/400" alt="Thời trang nam" />
                    <div className="featured-content">
                      <h4>Bộ sưu tập mới</h4>
                      <div onClick={() => handleCategoryClick('nam', 'bo-suu-tap-moi')} className="featured-link" style={{ cursor: 'pointer' }}>Khám phá ngay</div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <div 
                onClick={() => handleCategoryClick('tre-em')}
                className={location.pathname === '/products' && selectedFilter?.category?.value?.startsWith('tre-em') ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                Trẻ em
              </div>
            </li>
            <li className="nav-item">
              <div 
                onClick={() => handleCategoryClick('phu-kien')}
                className={location.pathname === '/products' && selectedFilter?.category?.value?.startsWith('phu-kien') ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                Phụ kiện
              </div>
            </li>
            <li className="nav-item">
              <div 
                onClick={() => handleCategoryClick('sale')}
                className={location.pathname === '/products' && selectedFilter?.category?.value === 'sale' ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                Sale
              </div>
            </li>
            <li className="nav-item">
              <div 
                onClick={() => handleCategoryClick('moi')}
                className={location.pathname === '/products' && selectedFilter?.category?.value === 'moi' ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                Mới
              </div>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={closeMobileMenu}>
                  Quản lý
                </Link>
                <div className="dropdown-menu">
                  <div className="dropdown-container">
                    <div className="dropdown-column admin-menu">
                      <h4>Quản lý</h4>
                      <ul>
                        <li>
                          <Link to="/admin/dashboard">
                            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/products">
                            <FontAwesomeIcon icon={faBox} /> Quản lý sản phẩm
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/orders">
                            <FontAwesomeIcon icon={faShoppingBag} /> Quản lý đơn hàng
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/users">
                            <FontAwesomeIcon icon={faUsers} /> Quản lý người dùng
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/reports">
                            <FontAwesomeIcon icon={faChartLine} /> Báo cáo & Thống kê
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            )}
      </ul>
        </nav>

        <div className="search-container desktop-only">
          <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
              placeholder="Tìm kiếm sản phẩm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
            <button type="submit" className="search-button">
              <i className="fa-solid fa-search"></i>
            </button>
          </form>
        </div>

        <div className="navbar-right">
          <div className="navbar-actions">
            <div className="action-item desktop-only">
              <Link to="/yeu-thich" className={location.pathname === '/yeu-thich' ? 'active' : ''}>
                <i className="fa-regular fa-heart"></i>
                <span className="action-text">Yêu thích</span>
              </Link>
            </div>
            
            {isLoggedIn ? (
              <div className="user-profile" ref={dropdownRef}>
                <button className="user-profile-button" onClick={toggleUserMenu}>
                  <img
                    src={userData?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData?.name || "User")}
                    alt="Avatar"
                    className="user-avatar"
                  />
                  <span>{userData?.name || "Người dùng"} <FontAwesomeIcon icon={faChevronDown} size="xs" /></span>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FontAwesomeIcon icon={faUser} />
                      <span>Hồ sơ</span>
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FontAwesomeIcon icon={faCog} />
                      <span>Cài đặt</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <FontAwesomeIcon icon={faTachometerAlt} />
                        <span>Trang quản trị</span>
                      </Link>
                    )}
                    <div className="dropdown-item" onClick={handleLogout} style={{cursor: 'pointer'}}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Đăng xuất</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons desktop-only">
                <Link to="/login" className="auth-button login-button">Đăng nhập</Link>
                <Link to="/register" className="auth-button register-button">Đăng ký</Link>
        </div>
            )}
            
            <div className="action-item cart-icon">
              <Link to="/gio-hang" className={location.pathname === '/gio-hang' ? 'active' : ''}>
                <i className="fa-solid fa-shopping-bag"></i>
                <span className="action-text desktop-only">Giỏ hàng</span>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            </div>
            <div className="action-item search-icon-mobile">
              <button>
                <i className="fa-solid fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`mobile-search ${mobileMenuOpen ? 'open' : ''}`}>
        <form className="search-box" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button type="submit" className="search-button">
            <i className="fa-solid fa-search"></i>
          </button>
        </form>
      </div>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
    </header>
  );
};

export default Navbar;
