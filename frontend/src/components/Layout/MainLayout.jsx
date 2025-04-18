import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../styles/css/MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const location = useLocation();
  const mainContainerRef = useRef(null);

  useEffect(() => {
    // Đóng sidebar trên mobile khi thay đổi trang
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="main-container" ref={mainContainerRef}>
        <div className={`sidebar-container`}>
          <Sidebar />
        </div>
        
        <div className="content">
          <Outlet />
        </div>
        
        <div className="overlay" onClick={handleOverlayClick}></div>
      </div>
      
      <button 
        className="sidebar-toggle-btn" 
        onClick={toggleSidebar}
        aria-label="Mở menu"
      >
        <i className="fa-solid fa-sliders"></i>
      </button>
      
      <Footer />
    </div>
  );
};

export default MainLayout; 