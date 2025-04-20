import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../../styles/css/MainLayout.css";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainContainerRef = useRef(null);

  useEffect(() => {
    // Kiểm tra đường dẫn hiện tại
    const isProductsPage = location.pathname.includes("/products");
    const isHomePage = location.pathname === "/";

    // Ẩn sidebar ở trang chủ, hiện ở trang sản phẩm (trên desktop)
    if (window.innerWidth >= 1150) {
      if (isProductsPage) {
        setSidebarOpen(true);
      } else if (isHomePage) {
        setSidebarOpen(false);
      }
    } else {
      // Luôn đóng sidebar trên mobile khi thay đổi trang
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      // Duy trì trạng thái hiển thị sidebar dựa vào đường dẫn khi resize
      const isProductsPage = location.pathname.includes("/products");
      const isHomePage = location.pathname === "/";

      if (window.innerWidth >= 1150) {
        if (isProductsPage) {
          setSidebarOpen(true);
        } else if (isHomePage) {
          setSidebarOpen(false);
        }
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    if (window.innerWidth < 1150) {
      setSidebarOpen(false);
    }
  };

  // Kiểm tra xem có phải đang ở trang chủ không
  const isHomePage = location.pathname === "/";
  const isProductsPage = location.pathname.includes("/products");

  return (
    <div
      className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${
        isHomePage ? "home-page" : ""
      }`}
    >
      <Navbar />

      <div className="main-container" ref={mainContainerRef}>
        {(!isHomePage || sidebarOpen) && (
          <div className={`sidebar-container`}>
            <Sidebar toggleSidebar={toggleSidebar} />
          </div>
        )}

        <div className="content">
          <Outlet />
        </div>

        <div className="overlay" onClick={handleOverlayClick}></div>
      </div>

      {/* Nút hiện sidebar khi sidebar đang ẩn */}
      {!isHomePage && !sidebarOpen && isProductsPage && (
        <button
          className="sidebar-show-btn"
          onClick={toggleSidebar}
          aria-label="Hiện bộ lọc"
        >
          <span>Bộ lọc</span>
          <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
        </button>
      )}

      {/* Nút toggle sidebar cho mobile */}
      {!isHomePage && window.innerWidth < 992 && (
        <button
          className="sidebar-toggle-btn-mobile"
          onClick={toggleSidebar}
          aria-label="Bộ lọc"
        >
          <span className="mobile-filter-text">Bộ lọc</span>
        </button>
      )}

      <Footer />
    </div>
  );
};

export default MainLayout;
