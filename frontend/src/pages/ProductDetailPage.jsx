import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById, getRelatedProducts } from "../service/productAPI";
import { useCart } from "../context/CartContext";
import "../styles/css/ProductDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faArrowLeft,
  faStar,
  faStarHalfAlt,
  faShieldAlt,
  faTruck,
  faUndoAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import ReviewList from "../components/Review/ReviewList";
import axios from "axios";
import ProductCard from "../components/Product/ProductCard";
import { getCategoryById } from "../service/categoryAPI";

const ProductDetailPage = ({ tagCategory }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const linkNav = {
    Áo: "ao",
    Quần: "quan",
    "Giày & Dép": "giayvadep",
    "Phụ kiện": "phukien",
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        const categoryData = await getCategoryById(data.category);
        setCategory(categoryData);
        // Lấy sản phẩm liên quan sau khi có thông tin sản phẩm
        try {
          const relatedData = await getRelatedProducts(id);
          console.log("Dữ liệu sản phẩm liên quan:", relatedData);
          setRelatedProducts(relatedData);
        } catch (err) {
          console.error("Lỗi khi lấy sản phẩm liên quan:", err);
          // Không báo lỗi chính vì đây chỉ là tính năng phụ
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }

    // Cuộn trang lên đầu khi component được mount
    window.scrollTo(0, 0);

    // Reset state khi thay đổi sản phẩm
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setSelectedImage(0);
    setAddedToCart(false);
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !id) return;

        setIsLoadingWishlist(true);
        const response = await axios.get(`/wishlist/${id}`, {
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
  }, [id]);

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước");
      return;
    }

    if (!selectedColor) {
      alert("Vui lòng chọn màu sắc");
      return;
    }

    const productToAdd = {
      id: product._id, // Đảm bảo có id
      name: product.name,
      price: product.discountPrice,
      images: product.images,
      selectedSize,
      selectedColor,
      quantity,
    };

    addToCart(productToAdd);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleToggleWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích");
        return;
      }

      setIsLoadingWishlist(true);

      if (isInWishlist) {
        // Xóa khỏi wishlist
        await axios.delete(`/wishlist/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInWishlist(false);
      } else {
        // Thêm vào wishlist
        await axios.post(
          "/wishlist",
          { productId: id },
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

  const handleNewRatingReview = (updateProduct) => {
    setProduct(updateProduct);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Đã xảy ra lỗi!</h2>
        <p>{error}</p>
        <Link to="/products" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link to="/products" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> <Link to="/products">Sản phẩm</Link>
        {tagCategory !== "" && (
          <Link to={`/products/${linkNav[tagCategory]}`}>{tagCategory}</Link>
        )}
        <span>{product.name}</span>
      </div>

      {addedToCart && (
        <div className="added-to-cart-notification">
          <FontAwesomeIcon icon={faCheck} />
          <span>Sản phẩm đã được thêm vào giỏ hàng</span>
        </div>
      )}

      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images[selectedImage] || product.mainImage}
              alt={product.name}
            />
            {product.discount > 0 && (
              <div className="product-badge discount-badge">
                -{product.discount}%
              </div>
            )}
          </div>

          <div className="thumbnail-images">
            {product.images &&
              product.images.map((image, index) => (
                <div
                  className={`thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  key={index}
                  onClick={() => handleImageSelect(index)}
                >
                  <img src={image} alt={`${product.name} - Ảnh ${index + 1}`} />
                </div>
              ))}
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>

          <div className="product-meta">
            <div className="product-rating">
              {[...Array(5)].map((_, i) => {
                const diff = product.rating - i;

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
              <span className="review-count">
                ({product.numReviews} đánh giá)
              </span>
            </div>
            <div className="product-sku">
              <span>Số lượng đã bán:</span> {product.soldCount}
            </div>
          </div>

          <div className="product-price">
            {product.hasDiscount ? (
              <>
                <span className="sale-price">
                  {product.discountPrice.toLocaleString()}đ
                </span>
                <span className="original-price">
                  {product.price.toLocaleString()}đ
                </span>
              </>
            ) : (
              <span className="regular-price">
                {product.price.toLocaleString()}đ
              </span>
            )}
          </div>

          <div className="product-status">
            <span
              className={`availability ${
                product.stock > 0 ? "in-stock" : "out-of-stock"
              }`}
            >
              <FontAwesomeIcon icon={faCheck} />
              {product.stockStatus}
            </span>
            <div className="countStock">(Tồn kho: {product.stock})</div>
          </div>

          <div className="product-short-description">
            <p>{product.description.split("\n")[0]}</p>
          </div>

          <div className="product-options">
            <div className="option-section">
              <h3>Màu sắc</h3>
              <div className="color-options">
                {product.colors &&
                  product.colors.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${
                        selectedColor === color ? "selected" : ""
                      }`}
                      onClick={() => handleColorSelect(color)}
                    >
                      {color}
                    </div>
                  ))}
              </div>
            </div>

            <div className="option-section">
              <h3>Kích thước</h3>
              <div className="size-options">
                {product.sizes &&
                  product.sizes.map((size) => (
                    <div
                      key={size}
                      className={`size-option ${
                        selectedSize === size ? "selected" : ""
                      }`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size}
                    </div>
                  ))}
              </div>
            </div>

            <div className="quantity-selector">
              <h3>Số lượng</h3>
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange("increase")}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="product-action">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FontAwesomeIcon icon={faShoppingCart} /> Thêm vào giỏ hàng
            </button>
            <button
              className={`add-to-wishlist-btn ${
                isInWishlist ? "in-wishlist" : ""
              }`}
              onClick={handleToggleWishlist}
              disabled={isLoadingWishlist}
            >
              <FontAwesomeIcon icon={faHeart} />{" "}
              {isInWishlist ? "Đã yêu thích" : "Yêu thích"}
            </button>
          </div>

          <div className="product-benefits">
            <div className="benefit">
              <FontAwesomeIcon icon={faTruck} />
              <div>
                <h4>Giao hàng miễn phí</h4>
                <p>Cho đơn hàng từ 500K</p>
              </div>
            </div>
            <div className="benefit">
              <FontAwesomeIcon icon={faShieldAlt} />
              <div>
                <h4>Bảo hành sản phẩm</h4>
                <p>Đổi trả trong 30 ngày</p>
              </div>
            </div>
            <div className="benefit">
              <FontAwesomeIcon icon={faUndoAlt} />
              <div>
                <h4>Đổi trả dễ dàng</h4>
                <p>Hoàn tiền 100%</p>
              </div>
            </div>
          </div>

          <div className="product-meta-info">
            <div className="meta-item">
              <span className="meta-label">Danh mục:</span>
              <span className="meta-value">{category.name}</span>
            </div>
            {product.tags && (
              <div className="meta-item">
                <span className="meta-label">Tags:</span>
                <span className="meta-value">
                  {product.tags.map((tag, index) => (
                    <span key={tag} className="tag">
                      {tag}
                      {index < product.tags.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tab-headers">
          <button
            className={`tab-header ${
              activeTab === "description" ? "active" : ""
            }`}
            onClick={() => setActiveTab("description")}
          >
            Mô tả
          </button>
          <button
            className={`tab-header ${
              activeTab === "additional" ? "active" : ""
            }`}
            onClick={() => setActiveTab("additional")}
          >
            Thông tin thêm
          </button>
          <button
            className={`tab-header ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Đánh giá ({product.reviews})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-panel">
              <h3>Mô tả sản phẩm</h3>
              {product.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {activeTab === "additional" && (
            <div className="tab-panel">
              <h3>Thông tin thêm</h3>
              <table className="additional-info-table">
                <tbody>
                  {product.attributes &&
                    product.attributes.map((attribute) => (
                      <tr key={attribute.name}>
                        <th>{attribute.name}</th>
                        <td>{attribute.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-panel">
              <h3>Đánh giá từ khách hàng</h3>
              <div className="reviews-summary">
                <div className="average-rating">
                  <span className="rating-number">
                    {product.rating.toFixed(1)}
                  </span>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => {
                      const diff = product.rating - i;

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
                  <p>Dựa trên {product.numReviews} đánh giá</p>
                </div>
              </div>

              <ReviewList
                productId={id}
                updateProduct={handleNewRatingReview}
              />
            </div>
          )}
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={{
                  _id: relatedProduct.id,
                  name: relatedProduct.name,
                  price: relatedProduct.price,
                  discountPrice: relatedProduct.discountPrice,
                  mainImage: relatedProduct.mainImage,
                  images: [relatedProduct.images],
                  category: relatedProduct.tagCategory,
                  isNewArrival: relatedProduct.isNewArrival,
                  discount: relatedProduct.hasDiscount,
                  tagCategory: relatedProduct.tagCategory,
                  rating: relatedProduct.rating,
                  numReviews: relatedProduct.numReviews,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
