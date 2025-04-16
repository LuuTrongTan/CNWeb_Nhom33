import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/css/Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="menu-toggle-mobile" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <Link to="/" className="logo">
            <span className="logo-text">ZIRA</span>
            <span className="logo-highlight">FASHION</span>
          </Link>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <Link to="/" className="logo">
              <span className="logo-text">ZIRA</span>
              <span className="logo-highlight">FASHION</span>
            </Link>
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
            <div className="action-item desktop-only">
              <Link to="/tai-khoan" className={location.pathname === '/tai-khoan' ? 'active' : ''}>
                <i className="fa-regular fa-user"></i>
                <span className="action-text">Tài khoản</span>
              </Link>
            </div>
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
