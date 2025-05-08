import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faEye,
  faStar,
  faStar as regularStar,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import "../../styles/css/ProductCard.css";

const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    price,
    images,
    category,
    discount = 0,
    tagCategory,
    mainImage,
    rating,
    numReviews,
  } = product;
  const discountedPrice =
    discount > 0 ? price - (price * discount) / 100 : price;

  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token || !_id) return;

        setIsLoadingWishlist(true);
        const response = await axios.get(`/wishlist/${_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setIsInWishlist(response.data.isInWishlist);
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", err);
      } finally {
        setIsLoadingWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [_id]);

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích");
        return;
      }

      setIsLoadingWishlist(true);

      if (isInWishlist) {
        // Xóa khỏi wishlist
        await axios.delete(`/wishlist/${_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInWishlist(false);
      } else {
        // Thêm vào wishlist
        await axios.post(
          "/wishlist",
          { productId: _id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật danh sách yêu thích:", err);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log({
      id: _id,
      name,
      price: discountedPrice,
      image: images[0],
      quantity: 1,
    });

    addToCart({
      id: _id,
      name,
      price: discountedPrice,
      images,
      image: images[0],
      quantity: 1,
    });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const navigateToProductDetail = () => {
    if (tagCategory === "") {
      navigate(`/products/${_id}`);
    } else if (tagCategory === "Áo") {
      navigate(`/products/ao/${_id}`);
    } else if (tagCategory === "Quần") {
      navigate(`/products/quan/${_id}`);
    } else if (tagCategory === "Giày & Dép") {
      navigate(`/products/giayvadep/${_id}`);
    } else if (tagCategory === "Phụ kiện") {
      navigate(`/products/phukien/${_id}`);
    } else {
      navigate(`/products/${_id}`);
    }
  };

  return (
    <div className="product-card-link" onClick={navigateToProductDetail}>
      <div className="product-card">
        <div className="product-image-container">
          {!imageLoaded && <div className="image-placeholder"></div>}
          <img
            src={mainImage ? mainImage : "/images/placeholder.png"}
            alt={name}
            className={`product-image ${imageLoaded ? "loaded" : ""}`}
            onLoad={handleImageLoad}
          />

          {product.isNewArrival && (
            <div className="product-badge new-badge">Mới</div>
          )}
          {discount > 0 && (
            <div className="product-badge discount-badge">-{discount}%</div>
          )}

          <div className="product-actions">
            <button
              className={`action-button wishlist-button ${
                isInWishlist ? "active" : ""
              }`}
              onClick={handleToggleWishlist}
              aria-label="Thêm vào yêu thích"
              disabled={isLoadingWishlist}
            >
              <FontAwesomeIcon icon={faHeart} />
            </button>
            <button
              className="action-button cart-button"
              onClick={handleAddToCart}
              aria-label="Thêm vào giỏ hàng"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
            <button
              className="action-button quickview-button"
              onClick={(e) => {
                e.stopPropagation();
                navigateToProductDetail();
              }}
              aria-label="Xem chi tiết"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
          </div>
        </div>

        <div className="product-info">
          <span className="product-category">{category?.name || category}</span>
          <h3 className="product-name">{name}</h3>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => {
                const diff = rating - i;

                let fillClass = "star-empty";
                if (diff >= 1) fillClass = "star-100";
                else if (diff >= 0.9) fillClass = "star-90";
                else if (diff >= 0.8) fillClass = "star-80";
                else if (diff >= 0.7) fillClass = "star-70";
                else if (diff >= 0.6) fillClass = "star-60";
                else if (diff >= 0.5) fillClass = "star-50";
                else if (diff >= 0.4) fillClass = "star-40";
                else if (diff >= 0.3) fillClass = "star-30";
                else if (diff >= 0.2) fillClass = "star-20";
                else if (diff >= 0.1) fillClass = "star-10";

                return (
                  <span key={i} className={`star ${fillClass}`}>
                    <FontAwesomeIcon icon={faStar} />
                  </span>
                );
              })}
            </div>
            <span className="rating-count">({numReviews})</span>
          </div>

          <div className="product-price">
            {discount > 0 && (
              <span className="original-price">
                {price.toLocaleString("vi-VN")}đ
              </span>
            )}
            <span className="current-price">
              {discountedPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <button className="quick-add" onClick={handleAddToCart}>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
