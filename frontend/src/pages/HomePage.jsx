import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/css/HomePage.css";
import { getFeaturedProducts } from "../service/productAPI";
import ProductCard from "../components/Product/ProductCard";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getFeaturedProducts();
        console.log("dkfndkf", response);
        setFeaturedProducts(response);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm");
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    {
      name: "Áo",
      image: "https://picsum.photos/seed/women/400/500",
      path: "products/ao",
    },
    {
      name: "Quần",
      image: "https://picsum.photos/seed/men/400/500",
      path: "products/quan",
    },
    {
      name: "Giày & Dép",
      image: "https://picsum.photos/seed/kids/400/500",
      path: "products/giayvadep",
    },
    {
      name: "Phụ Kiện",
      image: "https://picsum.photos/seed/accessories/400/500",
      path: "products/phukien",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Xu hướng thời trang mới nhất</h1>
          <p>Khám phá bộ sưu tập mùa hè 2023 với nhiều ưu đãi hấp dẫn</p>
          <Link to="/products" className="btn-primary">
            Mua ngay
          </Link>
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
          <Link to="/products" className="view-all">
            Xem tất cả
          </Link>
        </div>
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
      </section>

      {/* Banner ưu đãi */}
      <section className="promo-banner">
        <div className="promo-content">
          <h2>Giảm giá đến 50%</h2>
          <p>Cho tất cả sản phẩm mùa hè</p>
          <Link to="/products" className="btn-secondary">
            Khám phá ngay
          </Link>
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
