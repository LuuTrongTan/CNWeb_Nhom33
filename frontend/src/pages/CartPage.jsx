import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import "../styles/css/CartPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowLeft,
  faArrowRight,
  faTags,
  faMinus,
  faPlus,
  faPalette,
  faRuler,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { getProductById } from "../service/productAPI";

const CartPage = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    updateCartItem,
    selectedItems,
    toggleSelectItem,
    toggleSelectAll,
    getSelectedItems,
  } = useCart();
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false);

  // Lấy thông tin chi tiết của tất cả sản phẩm trong giỏ hàng
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cart.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const details = {};
        let hasError = false;

        // Tạo danh sách ID sản phẩm duy nhất để tránh tải trùng lặp
        const uniqueProductIds = [...new Set(cart.map((item) => item.id))];

        for (const productId of uniqueProductIds) {
          try {
            // Sử dụng hàm getProductById từ service
            const product = await getProductById(productId);
            if (product) {
              details[productId] = product;
            } else {
              console.warn(`Product ${productId} returned empty data`);
              hasError = true;
            }
          } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
            hasError = true;
          }
        }

        if (hasError) {
          console.warn(
            "Không thể tải đầy đủ thông tin sản phẩm. Một số tùy chọn có thể không hiển thị."
          );
        }

        setLocalCart(details);
      } catch (err) {
        console.error("Error fetching product details:", err);
        console.warn("Đã có lỗi xảy ra khi tải thông tin sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [cart]);

  // Toggle debug mode
  const toggleDebug = () => {
    setDebug(!debug);
  };

  const handleBuyNow = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    setShowCheckoutForm(true);
  };

  const handleQuantityChange = (itemId, action) => {
    const item = cart.find((item) => item.cartItemId === itemId);
    if (action === "increase") {
      updateQuantity(itemId, item.quantity + 1);
    } else if (action === "decrease" && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    }
  };

  const handleSizeChange = (itemId, newSize) => {
    updateCartItem(itemId, { selectedSize: newSize });
  };

  const handleColorChange = (itemId, newColor) => {
    updateCartItem(itemId, { selectedColor: newColor });
  };

  // Xử lý chọn tất cả sản phẩm
  const handleToggleSelectAll = (e) => {
    toggleSelectAll(e.target.checked);
  };

  // Tính tổng số sản phẩm trong giỏ hàng
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng số sản phẩm đã chọn
  const totalSelectedItems = getSelectedItems().reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Kiểm tra xem sản phẩm có size và color không
  const hasOptions = (productId) => {
    const product = localCart[productId];
    if (!product) return false;

    return (
      (product.sizes && product.sizes.length > 0) ||
      (product.colors && product.colors.length > 0)
    );
  };

  // Render phần debug nếu cần
  const renderDebugInfo = () => {
    if (!debug) return null;

    return (
      <div className="cartpage-debug">
        <h3>Debug Info:</h3>
        <pre>
          {JSON.stringify(
            {
              cartItems: cart.length,
              selectedItems,
              cartDetails: cart.map((item) => ({
                id: item.id,
                cartItemId: item.cartItemId,
                name: item.name,
                size: item.selectedSize,
                color: item.selectedColor,
              })),
              loadedProducts: Object.keys(localCart).length,
              productDetails: Object.keys(localCart).reduce((acc, key) => {
                const product = localCart[key];
                acc[key] = {
                  id: product._id,
                  name: product.name,
                  hasSizes: product.sizes?.length > 0,
                  sizesCount: product.sizes?.length || 0,
                  hasColors: product.colors?.length > 0,
                  colorsCount: product.colors?.length || 0,
                };
                return acc;
              }, {}),
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  };

  const handleCheckout = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="cartpage-container">
      <div className="cartpage-header">
        <h1 className="cartpage-title">Giỏ hàng của bạn</h1>
        {cart.length > 0 && (
          <div className="cartpage-summary">
            <span className="cartpage-total-items">{totalItems} sản phẩm</span>
            <button onClick={toggleDebug} className="cartpage-debug-toggle">
              {debug ? "Ẩn Debug" : "Hiện Debug"}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="cartpage-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Đang tải thông tin sản phẩm...</p>
        </div>
      )}

      {error && (
        <div className="cartpage-error">
          <p>{error}</p>
        </div>
      )}

      {debug && renderDebugInfo()}

      {cart.length === 0 ? (
        <div className="cartpage-empty">
          <i className="fa-solid fa-cart-shopping cartpage-empty-icon"></i>
          <p>Giỏ hàng của bạn đang trống!</p>
          <button
            className="cartpage-shop-btn"
            onClick={() => navigate("/products")}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại mua sắm
          </button>
        </div>
      ) : (
        <>
          <div className="cartpage-list">
            <div className="cartpage-table-header">
              <div className="cartpage-header-checkbox">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === cart.length && cart.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="cartpage-select-all"
                  id="select-all"
                />
                <label htmlFor="select-all" className="checkbox-label">
                  <span className="checkbox-custom">
                    {selectedItems.length === cart.length &&
                      cart.length > 0 && <FontAwesomeIcon icon={faCheck} />}
                  </span>
                  <span style={{ marginLeft: "8px" }}>Tất cả</span>
                </label>
              </div>
              <div className="cartpage-header-product">Sản phẩm</div>
              <div className="cartpage-header-price">Đơn giá</div>
              <div className="cartpage-header-quantity">Số lượng</div>
              <div className="cartpage-header-total">Thành tiền</div>
              <div className="cartpage-header-action"></div>
            </div>

            {cart.map((item) => {
              // Đảm bảo luôn sử dụng cartItemId nếu có, không dùng item.id
              const itemId = item.cartItemId || item.id;
              const isSelected = selectedItems.includes(itemId);

              return (
                <div
                  key={itemId}
                  className={`cartpage-item ${isSelected ? "selected" : ""}`}
                >
                  <div className="cartpage-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(itemId)}
                      className="cartpage-select-item"
                      id={`select-item-${itemId}`}
                    />
                    <label
                      htmlFor={`select-item-${itemId}`}
                      className="checkbox-label"
                    >
                      <span className="checkbox-custom">
                        {isSelected && <FontAwesomeIcon icon={faCheck} />}
                      </span>
                    </label>
                  </div>

                  <div className="cartpage-product">
                    <div className="cartpage-img-wrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cartpage-img"
                      />
                    </div>
                    <div className="cartpage-product-details">
                      <h3 className="cartpage-name">{item.name}</h3>

                      {/* Phần tùy chọn kích thước và màu sắc */}
                      <div className="cartpage-options">
                        {/* Hiển thị lựa chọn kích thước */}
                        {localCart[item.id]?.sizes &&
                          localCart[item.id].sizes.length > 0 && (
                            <div className="cartpage-option-group">
                              <div className="cartpage-option-title">
                                <FontAwesomeIcon icon={faRuler} />
                                <span>Kích thước:</span>
                              </div>
                              <div className="cartpage-sizes-list">
                                {localCart[item.id].sizes.map((size, idx) => (
                                  <span
                                    key={`${itemId}-size-${size}-${idx}`}
                                    className={`cartpage-size-option ${
                                      item.selectedSize === size
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleSizeChange(itemId, size)
                                    }
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Hiển thị lựa chọn màu sắc */}
                        {localCart[item.id]?.colors &&
                          localCart[item.id].colors.length > 0 && (
                            <div className="cartpage-option-group">
                              <div className="cartpage-option-title">
                                <FontAwesomeIcon icon={faPalette} />
                                <span>Màu sắc:</span>
                              </div>
                              <div className="cartpage-colors-list">
                                {localCart[item.id].colors.map((color, idx) => (
                                  <span
                                    key={`${itemId}-color-${color}-${idx}`}
                                    className={`cartpage-color-option ${
                                      item.selectedColor === color
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleColorChange(itemId, color)
                                    }
                                  >
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="cartpage-price-section">
                    {item.hasDiscount ? (
                      <>
                        <div className="cartpage-sale-price">
                          {item.price.toLocaleString()}{" "}
                          <span className="cartpage-currency">₫</span>
                        </div>
                        <div className="cartpage-original-price">
                          {item.originalPrice.toLocaleString()}{" "}
                          <span className="cartpage-currency">₫</span>
                        </div>
                        <div className="cartpage-discount-badge">
                          <FontAwesomeIcon icon={faTags} />
                          {Math.round(
                            ((item.originalPrice - item.price) /
                              item.originalPrice) *
                              100
                          )}
                          %
                        </div>
                      </>
                    ) : (
                      <div className="cartpage-regular-price">
                        {item.price.toLocaleString()}{" "}
                        <span className="cartpage-currency">₫</span>
                      </div>
                    )}
                  </div>

                  <div className="cartpage-quantity-section">
                    <div className="cartpage-qty-controls">
                      <button
                        className="cartpage-qty-btn"
                        onClick={() => handleQuantityChange(itemId, "decrease")}
                        disabled={item.quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        className="cartpage-qty"
                        onChange={(e) =>
                          updateQuantity(itemId, parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        className="cartpage-qty-btn"
                        onClick={() => handleQuantityChange(itemId, "increase")}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>

                  <div className="cartpage-total-section">
                    <div className="cartpage-item-total">
                      {(item.price * item.quantity).toLocaleString()}{" "}
                      <span className="cartpage-currency">₫</span>
                    </div>
                  </div>

                  <div className="cartpage-action-section">
                    <button
                      onClick={() => {
                        console.log(`Xóa sản phẩm với cartItemId: ${itemId}`);
                        removeFromCart(itemId);
                      }}
                      className="cartpage-remove"
                      title="Xóa sản phẩm"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cartpage-footer">
            <div className="cartpage-summary-section">
              <div className="cartpage-summary-row">
                <span>Đã chọn {totalSelectedItems} sản phẩm</span>
              </div>
              <div className="cartpage-summary-row">
                <span>Tổng tiền ({totalSelectedItems} sản phẩm):</span>
                <span className="cartpage-summary-value">
                  {calculateTotal().toLocaleString()} ₫
                </span>
              </div>
            </div>
            <div className="cartpage-actions">
              <button
                className="cartpage-continue-shopping"
                onClick={() => navigate("/products")}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Tiếp tục mua sắm
              </button>
              <button
                onClick={handleCheckout}
                className="cartpage-checkout"
                disabled={getSelectedItems().length === 0}
              >
                Tiến hành thanh toán <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
