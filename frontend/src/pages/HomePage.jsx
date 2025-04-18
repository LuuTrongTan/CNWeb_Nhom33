import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/css/HomePage.css';

const Home = () => {
  const featuredProducts = [
    { id: 1, name: 'Áo Thun Basic', price: 250000, image: 'https://picsum.photos/seed/product1/300/400', category: 'Áo' },
    { id: 2, name: 'Quần Jeans Slim Fit', price: 550000, image: 'https://picsum.photos/seed/product2/300/400', category: 'Quần' },
    { id: 3, name: 'Áo Khoác Bomber', price: 750000, image: 'https://picsum.photos/seed/product3/300/400', category: 'Áo' },
    { id: 4, name: 'Váy Liền Thân', price: 450000, image: 'https://picsum.photos/seed/product4/300/400', category: 'Váy' },
  ];

  const categories = [
    { name: 'Nữ', image: 'https://picsum.photos/seed/women/400/500', path: '/nu' },
    { name: 'Nam', image: 'https://picsum.photos/seed/men/400/500', path: '/nam' },
    { name: 'Trẻ Em', image: 'https://picsum.photos/seed/kids/400/500', path: '/tre-em' },
    { name: 'Phụ Kiện', image: 'https://picsum.photos/seed/accessories/400/500', path: '/phu-kien' },
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Xu hướng thời trang mới nhất</h1>
          <p>Khám phá bộ sưu tập mùa hè 2023 với nhiều ưu đãi hấp dẫn</p>
          <Link to="/moi" className="btn-primary">Mua ngay</Link>
        </div>
      </section>

      {/* Danh mục */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Danh mục sản phẩm</h2>
          <p>Chọn theo nhu cầu của bạn</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link to={category.path} className="category-card" key={index}>
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="featured-products">
        <div className="section-header">
          <h2>Sản phẩm nổi bật</h2>
          <Link to="/products" className="view-all">Xem tất cả</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                <div className="product-actions">
                  <button className="action-btn"><i className="fa-solid fa-heart"></i></button>
                  <button className="action-btn"><i className="fa-solid fa-cart-shopping"></i></button>
                  <button className="action-btn"><i className="fa-solid fa-eye"></i></button>
                </div>
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">{product.price.toLocaleString()}đ</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner ưu đãi */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Giảm giá đến 50%</h2>
          <p>Cho tất cả sản phẩm mùa hè</p>
          <Link to="/sale" className="btn-secondary">Khám phá ngay</Link>
        </div>
      </section>

      {/* Dịch vụ */}
      <section className="services-section">
        <div className="service-item">
          <i className="fa-solid fa-truck-fast"></i>
          <h3>Giao hàng nhanh</h3>
          <p>Miễn phí cho đơn từ 500k</p>
        </div>
        <div className="service-item">
          <i className="fa-solid fa-rotate-left"></i>
          <h3>Đổi trả dễ dàng</h3>
          <p>Trong vòng 30 ngày</p>
        </div>
        <div className="service-item">
          <i className="fa-solid fa-credit-card"></i>
          <h3>Thanh toán an toàn</h3>
          <p>Nhiều phương thức</p>
        </div>
        <div className="service-item">
          <i className="fa-solid fa-headset"></i>
          <h3>Hỗ trợ 24/7</h3>
          <p>Tư vấn trực tuyến</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 