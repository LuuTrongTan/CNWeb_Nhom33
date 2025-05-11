import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/AddToCartModal.css";
import { getProductById } from "../../service/productAPI";

const AddToCartModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (isOpen && product && (product._id || product.id)) {
        setLoading(true);
        try {
          const productId = product._id || product.id;
          console.log("Fetching product details for ID:", productId);
          const data = await getProductById(productId);
          console.log("Product in modal:", data);
          console.log("Product colors:", data.colors);
          console.log("Product sizes:", data.sizes);
          setProductDetails(data);
        } catch (err) {
          console.error("Lỗi khi lấy thông tin chi tiết sản phẩm:", err);
          setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setError("");
      fetchProductDetails();
    }
  }, [isOpen, product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Kiểm tra người dùng đã chọn đủ thông tin chưa
    if (!selectedSize) {
      setError("Vui lòng chọn kích thước");
      return;
    }
    
    if (!selectedColor) {
      setError("Vui lòng chọn màu sắc");
      return;
    }
    
    // Sử dụng productDetails nếu có, nếu không thì dùng product ban đầu
    const productData = productDetails || product;
    
    // Chuẩn bị dữ liệu sản phẩm để thêm vào giỏ hàng
    const productToAdd = {
      id: productData._id || productData.id,
      name: productData.name,
      price: productData.discount ? productData.discountPrice : productData.price,
      originalPrice: productData.price,
      hasDiscount: productData.discount || false,
      images: productData.images || [productData.image],
      image: productData.images?.[0] || productData.image,
      selectedSize,
      selectedColor,
      quantity,
    };
    
    // Gọi hàm thêm vào giỏ hàng
    onAddToCart(productToAdd);
    onClose();
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Nếu không có sản phẩm hoặc modal không mở
  if (!isOpen || (!product && !productDetails)) return null;

  // Sử dụng productDetails nếu có, nếu không thì dùng product ban đầu
  const displayProduct = productDetails || product;

  return (
    <div className="add-to-cart-modal-overlay">
      <div className="add-to-cart-modal">
        <div className="modal-header">
          <h3>Thêm vào giỏ hàng</h3>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : (
            <>
              <div className="product-info-modal">
                <h4>{displayProduct.name}</h4>
                <p className="product-price-modal">
                  {displayProduct.discount ? displayProduct.discountPrice?.toLocaleString("vi-VN") : displayProduct.price?.toLocaleString("vi-VN")}đ
                </p>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit} className="cart-form">
                <div className="form-group">
                  <label htmlFor="size-select">Kích thước:</label>
                  <select 
                    id="size-select"
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Chọn kích thước</option>
                    {displayProduct.sizes?.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="color-select">Màu sắc:</label>
                  <select 
                    id="color-select"
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Chọn màu sắc</option>
                    {displayProduct.colors?.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Số lượng:</label>
                  <div className="quantity-control">
                    <button 
                      type="button" 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="text" 
                      className="quantity-input" 
                      value={quantity} 
                      readOnly 
                    />
                    <button 
                      type="button" 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange("increase")}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" className="add-to-cart-button">
                    Thêm vào giỏ
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal; 