import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  faTachometerAlt, 
  faBox, 
  faShoppingCart, 
  faUsers, 
  faTags, 
  faChartBar, 
  faCog, 
  faBars, 
  faSignOutAlt,
  faChevronDown,
  faChevronUp,
  faImages
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/css/Admin/AdminLayout.css';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    products: false,
    orders: false,
    customers: false,
    marketing: false
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Đóng sidebar trên thiết bị di động khi thay đổi route
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };
  
  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };
  
  const handleLogout = () => {
    // Logic đăng xuất
    navigate('/login');
  };
  
  const sidebarClass = collapsed ? 'admin-sidebar collapsed' : 'admin-sidebar';
  const contentClass = collapsed ? 'admin-content expanded' : 'admin-content';
  
  // Kiểm tra active menu item
  const isActive = (path) => {
    return location.pathname === `/admin${path}` ? 'active' : '';
  };
  
  const renderSidebar = () => (
    <aside className={sidebarClass + (mobileSidebarOpen && isMobile ? ' mobile-open' : '')}>
      <div className="admin-sidebar-header">
        <h2>{collapsed ? 'A' : 'Admin'}</h2>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      
      <nav className="admin-sidebar-menu">
        <ul>
          <li className={isActive('')}>
            <Link to="/admin">
              <FontAwesomeIcon icon={faTachometerAlt} />
              {!collapsed && <span>Tổng quan</span>}
            </Link>
          </li>
          
          <li className={location.pathname.includes('/admin/products') ? 'active' : ''}>
            <div className="sidebar-item" onClick={() => toggleDropdown('products')}>
              <div className="sidebar-item-content">
                <FontAwesomeIcon icon={faBox} />
                {!collapsed && <span>Sản phẩm</span>}
              </div>
              {!collapsed && (
                <FontAwesomeIcon 
                  icon={dropdowns.products ? faChevronUp : faChevronDown} 
                  className="dropdown-icon"
                />
              )}
            </div>
            
            {dropdowns.products && !collapsed && (
              <ul className="sidebar-dropdown">
                <li>
                  <Link to="/admin/products">Danh sách sản phẩm</Link>
                </li>
                <li>
                  <Link to="/admin/products/add">Thêm sản phẩm</Link>
                </li>
                <li>
                  <Link to="/admin/categories">Danh mục</Link>
                </li>
              </ul>
            )}
          </li>
          
          <li className={location.pathname.includes('/admin/orders') ? 'active' : ''}>
            <div className="sidebar-item" onClick={() => toggleDropdown('orders')}>
              <div className="sidebar-item-content">
                <FontAwesomeIcon icon={faShoppingCart} />
                {!collapsed && <span>Đơn hàng</span>}
              </div>
              {!collapsed && (
                <FontAwesomeIcon 
                  icon={dropdowns.orders ? faChevronUp : faChevronDown} 
                  className="dropdown-icon"
                />
              )}
            </div>
            
            {dropdowns.orders && !collapsed && (
              <ul className="sidebar-dropdown">
                <li>
                  <Link to="/admin/orders">Tất cả đơn hàng</Link>
                </li>
                <li>
                  <Link to="/admin/orders?status=pending">Chưa xử lý</Link>
                </li>
                <li>
                  <Link to="/admin/orders?status=processing">Đang xử lý</Link>
                </li>
                <li>
                  <Link to="/admin/orders?status=shipped">Đang giao hàng</Link>
                </li>
                <li>
                  <Link to="/admin/orders?status=completed">Hoàn thành</Link>
                </li>
                <li>
                  <Link to="/admin/orders?status=cancelled">Đã hủy</Link>
                </li>
              </ul>
            )}
          </li>
          
          <li className={location.pathname.includes('/admin/customers') ? 'active' : ''}>
            <div className="sidebar-item" onClick={() => toggleDropdown('customers')}>
              <div className="sidebar-item-content">
                <FontAwesomeIcon icon={faUsers} />
                {!collapsed && <span>Khách hàng</span>}
              </div>
              {!collapsed && (
                <FontAwesomeIcon 
                  icon={dropdowns.customers ? faChevronUp : faChevronDown} 
                  className="dropdown-icon"
                />
              )}
            </div>
            
            {dropdowns.customers && !collapsed && (
              <ul className="sidebar-dropdown">
                <li>
                  <Link to="/admin/customers">Danh sách</Link>
                </li>
                <li>
                  <Link to="/admin/customers/reviews">Đánh giá</Link>
                </li>
              </ul>
            )}
          </li>
          
          <li className={location.pathname.includes('/admin/marketing') ? 'active' : ''}>
            <div className="sidebar-item" onClick={() => toggleDropdown('marketing')}>
              <div className="sidebar-item-content">
                <FontAwesomeIcon icon={faTags} />
                {!collapsed && <span>Marketing</span>}
              </div>
              {!collapsed && (
                <FontAwesomeIcon 
                  icon={dropdowns.marketing ? faChevronUp : faChevronDown} 
                  className="dropdown-icon"
                />
              )}
            </div>
            
            {dropdowns.marketing && !collapsed && (
              <ul className="sidebar-dropdown">
                <li>
                  <Link to="/admin/banners">Banner</Link>
                </li>
                <li>
                  <Link to="/admin/marketing/coupons">Mã giảm giá</Link>
                </li>
                <li>
                  <Link to="/admin/marketing/promotions">Khuyến mãi</Link>
                </li>
              </ul>
            )}
          </li>
          
          <li className={isActive('/reports')}>
            <Link to="/admin/reports">
              <FontAwesomeIcon icon={faChartBar} />
              {!collapsed && <span>Báo cáo</span>}
            </Link>
          </li>
          
          <li className={isActive('/settings')}>
            <Link to="/admin/settings">
              <FontAwesomeIcon icon={faCog} />
              {!collapsed && <span>Cài đặt</span>}
            </Link>
          </li>
          
          <li>
            <a href="#" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              {!collapsed && <span>Đăng xuất</span>}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
  
  return (
    <div className="admin-layout">
      {renderSidebar()}
      
      <div className={contentClass}>
        <header className="admin-header">
          <div className="header-left">
            {isMobile && (
              <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faBars} />
              </button>
            )}
            <h1>Admin Portal</h1>
          </div>
          
          <div className="header-right">
            <div className="admin-user">
              <img 
                src="https://randomuser.me/api/portraits/men/85.jpg" 
                alt="Admin User" 
                className="admin-avatar"
              />
              <span className="admin-name">Admin</span>
            </div>
          </div>
        </header>
        
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay cho mobile */}
      {mobileSidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout; 