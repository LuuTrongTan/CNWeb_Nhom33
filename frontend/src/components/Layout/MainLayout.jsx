import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../styles/css/MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Tự động đóng sidebar trên thiết bị di động
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Khởi tạo
    handleResize();
    
    // Đăng ký sự kiện thay đổi kích thước
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Đóng sidebar khi chuyển trang trên thiết bị di động
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="main-container">
        <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar />
        </div>
        <main className="content">
          <Outlet />
        </main>
      </div>
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} 
        onClick={toggleSidebar}
      ></div>
      <Footer />
    </div>
  );
};

export default MainLayout; 