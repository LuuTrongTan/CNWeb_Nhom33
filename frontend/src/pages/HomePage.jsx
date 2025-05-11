import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/css/HomePage.css";
import { getFeaturedProducts } from "../service/productAPI";
import ProductCard from "../components/Product/ProductCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faRotateLeft,
  faCreditCard,
  faHeadset,
  faArrowRight,
  faStar,
  faFire
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedProducts();
        
        // Chia sản phẩm thành hai nhóm: nổi bật và mới nhất
        const featured = response.slice(0, 4);
        const newItems = response.slice(4, 8);
        
        setFeaturedProducts(featured);
        setNewArrivals(newItems);
        setLoading(false);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm");
        console.error("Lỗi khi tải sản phẩm:", err);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Danh mục sản phẩm
  const categories = [
    {
      name: "Áo",
      image: "/aothun.jpg",
      path: "products/ao",
      description: "Các mẫu áo thun, áo sơ mi, áo khoác mới nhất"
    },
    {
      name: "Quần",
      image: "/quanjean.jpg",
      path: "products/quan",
      description: "Quần jean, quần kaki, quần tây thời trang"
    },
    {
      name: "Giày & Dép",
      image: "/giay.jpg",
      path: "products/giayvadep",
      description: "Đa dạng giày thể thao, giày tây, dép các loại"
    },
    {
      name: "Phụ Kiện",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80",
      path: "products/phukien",
      description: "Thắt lưng, ví, túi, phụ kiện thời trang"
    },
  ];

  // Ưu đãi đặc biệt
  const specialOffers = [
    {
      title: "Giảm 50% cho đơn hàng đầu tiên",
      description: "Sử dụng mã WELCOME50",
      color: "primary"
    },
    {
      title: "Flash Sale mỗi thứ sáu",
      description: "Giảm tới 70% các sản phẩm chọn lọc",
      color: "secondary"
    },
    {
      title: "Miễn phí vận chuyển",
      description: "Cho đơn hàng từ 500.000đ",
      color: "accent"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Thời trang cho mọi khoảnh khắc</h1>
          <p>Khám phá bộ sưu tập mới với phong cách độc đáo chỉ có tại cửa hàng chúng tôi</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Mua sắm ngay
            </Link>
            <Link to="/products/ao" className="btn-outline">
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
      </section>

      {/* Ưu đãi đặc biệt */}
      <section className="special-offers">
        <div className="offers-container">
          {specialOffers.map((offer, index) => (
            <div key={index} className={`offer-card offer-${offer.color}`}>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Danh mục sản phẩm */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Danh mục nổi bật</h2>
          <p>Khám phá thương hiệu và phong cách của bạn</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <Link to={category.path} className="category-card" key={index}>
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <div className="category-content">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="category-link">
                  Khám phá ngay <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="featured-products">
        <div className="section-header">
          <h2>
            <FontAwesomeIcon icon={faFire} className="section-icon" /> Sản phẩm nổi bật
          </h2>
          <Link to="/products" className="view-all">
            Xem tất cả
          </Link>
        </div>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  _id: product.id,
                  name: product.name,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  mainImage: product.mainImage,
                  images: [product.images],
                  category: product.tagCategory,
                  isNewArrival: product.isNewArrival,
                  discount: product.hasDiscount,
                  tagCategory: product.tagCategory,
                  rating: product.rating,
                  numReviews: product.numReviews,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner ưu đãi */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Bộ sưu tập mùa hè</h2>
          <p>Giảm giá đến 30% cho tất cả sản phẩm</p>
          <Link to="/products" className="btn-secondary">
            Mua sắm ngay
          </Link>
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="new-arrivals">
        <div className="section-header">
          <h2>
            <FontAwesomeIcon icon={faStar} className="section-icon" /> Sản phẩm mới
          </h2>
          <Link to="/products" className="view-all">
            Xem tất cả
          </Link>
        </div>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="products-grid">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  _id: product.id,
                  name: product.name,
                  price: product.price,
                  discountPrice: product.discountPrice,
                  mainImage: product.mainImage,
                  images: [product.images],
                  category: product.tagCategory,
                  isNewArrival: product.isNewArrival,
                  discount: product.hasDiscount,
                  tagCategory: product.tagCategory,
                  rating: product.rating,
                  numReviews: product.numReviews,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dịch vụ */}
      <section className="services-section">
        <div className="service-item">
          <div className="service-icon">
            <FontAwesomeIcon icon={faTruck} />
          </div>
          <h3>Giao hàng nhanh</h3>
          <p>Miễn phí cho đơn từ 500k</p>
        </div>
        <div className="service-item">
          <div className="service-icon">
            <FontAwesomeIcon icon={faRotateLeft} />
          </div>
          <h3>Đổi trả dễ dàng</h3>
          <p>Trong vòng 30 ngày</p>
        </div>
        <div className="service-item">
          <div className="service-icon">
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <h3>Thanh toán an toàn</h3>
          <p>Nhiều phương thức</p>
        </div>
        <div className="service-item">
          <div className="service-icon">
            <FontAwesomeIcon icon={faHeadset} />
          </div>
          <h3>Hỗ trợ 24/7</h3>
          <p>Tư vấn trực tuyến</p>
        </div>
      </section>

      {/* Đăng ký nhận thông tin */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Đăng ký nhận thông tin</h2>
          <p>Nhận thông báo về các sản phẩm mới và ưu đãi đặc biệt</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Nhập email của bạn" />
            <button className="btn-primary">Đăng ký</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
