import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faHeart,
  faUser,
  faSearch,
  faBars,
  faTimes,
  faSignOutAlt,
  faUserCircle,
  faHistory,
  faClipboardList,
  faCog,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import '../../../src/styles/css/Navbar.css';
import logoImage from '../../assets/images/logo.png';  // Import logo

const Navbar = ({ toggleSidebar }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Mock data cho giỏ hàng và wishlist cho đến khi có API đầy đủ
  const cartItems = [];
  const wishlistItems = [];

  // Xử lý scroll
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

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    }
  };

  // Xử lý tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          
          
          <Link to="/" className="navbar-logo">
            <div className="logo-container">
              <div className="logo-image-container">
                <img src={logoImage} alt="S and T" className="logo-image" />
              </div>
              <div className="logo-text">
                <span className="logo-name">S and T</span>
                <span className="logo-slogan">Style in Every Thread</span>
              </div>
            </div>
          </Link>
          
          <ul className="main-nav">
            <div className="mobile-nav-header">
              <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/products" className={location.pathname.includes('/products') ? 'active' : ''}>
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="navbar-right">
          <div className={`search-box ${searchFocused ? 'focused' : ''}`}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button type="submit" aria-label="Search">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          </div>
          
          <div className="navbar-actions">
            <Link to="/wishlist" className="nav-icon-link">
              <FontAwesomeIcon icon={faHeart} />
              {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
            </Link>
            
            <Link to="/cart" className="nav-icon-link">
              <FontAwesomeIcon icon={faShoppingCart} />
              {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
            </Link>
            
            {currentUser ? (
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-button" 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="user-avatar" 
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} />
                  )}
                </button>
                
                {userDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="user-info">
                      <strong>{currentUser.name}</strong>
                      <span className="user-email">{currentUser.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    <Link to="/profile">
                      <FontAwesomeIcon icon={faUserCircle} />
                      Thông tin cá nhân
                    </Link>
                    
                    <Link to="/orders">
                      <FontAwesomeIcon icon={faHistory} />
                      Lịch sử đơn hàng
                    </Link>
                    
                    {currentUser.role === 'admin' && (
                      <Link to="/admin/dashboard">
                        <FontAwesomeIcon icon={faShieldAlt} />
                        Quản trị viên
                      </Link>
                    )}
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="logout-button" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-icon-link">
                <FontAwesomeIcon icon={faUser} />
              </Link>
            )}
          </div>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          
          <button 
            className="mobile-search-toggle" 
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
      {mobileSearchOpen && (
        <div className="search-box mobile-open">
          <button className="close-search" onClick={() => setMobileSearchOpen(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" aria-label="Search">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
