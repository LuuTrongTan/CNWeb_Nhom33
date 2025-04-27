import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faEye,
  faStar as solidStar,
  faStar as regularStar,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import "../../styles/css/ProductCard.css";

const ProductCard = ({ product }) => {
  const { _id, name, price, images, category, discount = 0 } = product;
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

    addToCart({
      id: _id,
      name,
      price: discountedPrice,
      image: images[0],
      quantity: 1,
    });
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const navigateToProductDetail = () => {
    navigate(`/products/${_id}`);
  };

  return (
    <div className="product-card-link" onClick={navigateToProductDetail}>
      <div className="product-card">
        <div className="product-image-container">
          {!imageLoaded && <div className="image-placeholder"></div>}
          <img
            src={
              images && images.length > 0
                ? images[0]
                : "/images/placeholder.png"
            }
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
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${
                    i < Math.floor(Math.random() * 2 + 3) ? "filled" : ""
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-count">
              ({Math.floor(Math.random() * 20 + 5)})
            </span>
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
