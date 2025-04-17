import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/css/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faCog, faSignOutAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/images/logo.png'; // Đường dẫn đến hình ảnh logo

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Giả lập trạng thái đăng nhập
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const dropdownRef = useRef(null);

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
    setIsLoggedIn(false);
    setShowUserMenu(false);
    // Thêm logic đăng xuất thực tế ở đây
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
            <img src={logo} alt="Logo" className="logo-image" />
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
              <Link to="/nu" className={location.pathname.startsWith('/nu') ? 'active' : ''} onClick={closeMobileMenu}>
                Nữ
              </Link>
              <div className="dropdown-menu">
                <div className="dropdown-container">
                  <div className="dropdown-column">
                    <h4>Áo</h4>
                    <ul>
                      <li><Link to="/nu/ao-thun">Áo thun</Link></li>
                      <li><Link to="/nu/ao-so-mi">Áo sơ mi</Link></li>
                      <li><Link to="/nu/ao-khoac">Áo khoác</Link></li>
                      <li><Link to="/nu/ao-len">Áo len</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Quần & Váy</h4>
                    <ul>
                      <li><Link to="/nu/quan-dai">Quần dài</Link></li>
                      <li><Link to="/nu/quan-jeans">Quần jeans</Link></li>
                      <li><Link to="/nu/vay">Váy</Link></li>
                      <li><Link to="/nu/chan-vay">Chân váy</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Phụ kiện</h4>
                    <ul>
                      <li><Link to="/nu/tui-xach">Túi xách</Link></li>
                      <li><Link to="/nu/giay">Giày</Link></li>
                      <li><Link to="/nu/that-lung">Thắt lưng</Link></li>
                      <li><Link to="/nu/trang-suc">Trang sức</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column dropdown-featured">
                    <img src="https://picsum.photos/seed/women/300/400" alt="Thời trang nữ" />
                    <div className="featured-content">
                      <h4>Bộ sưu tập mới</h4>
                      <Link to="/nu/bo-suu-tap-moi" className="featured-link">Khám phá ngay</Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/nam" className={location.pathname.startsWith('/nam') ? 'active' : ''} onClick={closeMobileMenu}>
                Nam
              </Link>
              <div className="dropdown-menu">
                <div className="dropdown-container">
                  <div className="dropdown-column">
                    <h4>Áo</h4>
                    <ul>
                      <li><Link to="/nam/ao-thun">Áo thun</Link></li>
                      <li><Link to="/nam/ao-so-mi">Áo sơ mi</Link></li>
                      <li><Link to="/nam/ao-khoac">Áo khoác</Link></li>
                      <li><Link to="/nam/ao-len">Áo len</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Quần</h4>
                    <ul>
                      <li><Link to="/nam/quan-dai">Quần dài</Link></li>
                      <li><Link to="/nam/quan-jeans">Quần jeans</Link></li>
                      <li><Link to="/nam/quan-kaki">Quần kaki</Link></li>
                      <li><Link to="/nam/quan-short">Quần short</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column">
                    <h4>Phụ kiện</h4>
                    <ul>
                      <li><Link to="/nam/giay">Giày</Link></li>
                      <li><Link to="/nam/that-lung">Thắt lưng</Link></li>
                      <li><Link to="/nam/vi">Ví</Link></li>
                      <li><Link to="/nam/dong-ho">Đồng hồ</Link></li>
                    </ul>
                  </div>
                  <div className="dropdown-column dropdown-featured">
                    <img src="https://picsum.photos/seed/men/300/400" alt="Thời trang nam" />
                    <div className="featured-content">
                      <h4>Bộ sưu tập mới</h4>
                      <Link to="/nam/bo-suu-tap-moi" className="featured-link">Khám phá ngay</Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/tre-em" className={location.pathname.startsWith('/tre-em') ? 'active' : ''} onClick={closeMobileMenu}>
                Trẻ em
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/phu-kien" className={location.pathname.startsWith('/phu-kien') ? 'active' : ''} onClick={closeMobileMenu}>
                Phụ kiện
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/sale" className={location.pathname.startsWith('/sale') ? 'active' : ''} onClick={closeMobileMenu}>
                Sale
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/moi" className={location.pathname.startsWith('/moi') ? 'active' : ''} onClick={closeMobileMenu}>
                Mới
              </Link>
            </li>
          </ul>
        </nav>

        <div className="search-container desktop-only">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button className="search-button">
              <i className="fa-solid fa-search"></i>
            </button>
          </div>
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
                    src="https://randomuser.me/api/portraits/men/1.jpg" // Thay thế bằng avatar của người dùng
                    alt="Avatar"
                    className="user-avatar"
                  />
                  <span>Người dùng <FontAwesomeIcon icon={faChevronDown} size="xs" /></span>
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
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <button className="search-button">
            <i className="fa-solid fa-search"></i>
          </button>
        </div>
      </div>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
    </header>
  );
};

export default Navbar;
