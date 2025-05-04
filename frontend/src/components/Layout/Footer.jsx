import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <Link to="/" className="logo">
              <span className="logo-text">ZIRA</span>
              <span className="logo-highlight">FASHION</span>
            </Link>
            <p className="slogan">Thời trang phong cách - Đẳng cấp cho mọi người</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h3>Về chúng tôi</h3>
              <ul>
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/career">Tuyển dụng</Link></li>
                <li><Link to="/news">Tin tức</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Hỗ trợ khách hàng</h3>
              <ul>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
                <li><Link to="/return">Chính sách đổi trả</Link></li>
                <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Dịch vụ khách hàng</h3>
              <ul>
                <li><Link to="/membership">Thành viên</Link></li>
                <li><Link to="/gift-card">Thẻ quà tặng</Link></li>
                <li><Link to="/promotion">Khuyến mãi</Link></li>
                <li><Link to="/newsletter">Đăng ký bản tin</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-newsletter">
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin về sản phẩm mới và khuyến mãi hấp dẫn</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Email của bạn" />
              <button type="submit">Đăng ký</button>
            </div>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fa-brands fa-tiktok"></i></a>
              <a href="#" className="social-link"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} ZIRA Fashion. Tất cả quyền được bảo lưu.
          </div>
          <div className="payment-methods">
            <span className="payment-icon"><i className="fa-brands fa-cc-visa"></i></span>
            <span className="payment-icon"><i className="fa-brands fa-cc-mastercard"></i></span>
            <span className="payment-icon"><i className="fa-brands fa-cc-paypal"></i></span>
            <span className="payment-icon"><i className="fa-solid fa-money-bill-wave"></i></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
