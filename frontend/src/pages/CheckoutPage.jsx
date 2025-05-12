import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateProduct } from "../service/productAPI";
import {
  faArrowLeft,
  faSpinner,
  faCheck,
  faShoppingBag,
  faMapMarkerAlt,
  faCreditCard,
  faNoteSticky,
  faChevronDown,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../styles/css/CheckoutPage.css";
import { getDistance } from "../service/shippingAPI";
import { createOrder } from "../services/order.service";

// Tạo instance axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token xác thực
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, calculateTotal, clearCart, getSelectedItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);

  // State cho các dropdown

  const [addressConfirmed, setAddressConfirmed] = useState(false);

  // Phương thức vận chuyển
  const [shippingMethods, setShippingMethods] = useState([
    {
      id: "standard",
      name: "Giao hàng tiêu chuẩn",
      description: "3-5 ngày",
      fee: 0,
    },
    {
      id: "fast",
      name: "Giao hàng nhanh",
      description: "1-2 ngày",
      fee: 20000,
    },
    {
      id: "express",
      name: "Giao hàng hỏa tốc",
      description: "Trong ngày",
      fee: 50000,
    },
  ]);

  const [orderInfo, setOrderInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    paymentMethod: "cod",
    shippingMethod: "standard",
    notes: "",
    distance: 0, // Khoảng cách giao hàng
  });

  // Kiểm tra xem có sản phẩm được chọn không
  useEffect(() => {
    const selectedItems = getSelectedItems();
    console.log(selectedItems);
    if (!selectedItems || selectedItems.length === 0) {
      alert("Vui lòng chọn sản phẩm để thanh toán!");
      navigate("/cart");
    }
  }, []);

  // Lấy thông tin người dùng đã đăng nhập
  useEffect(() => {
    const fetchUserShippingInfo = async () => {
      if (isAuthenticated) {
        try {
          setLoadingUserInfo(true);
          const response = await api.get("/users/shipping-info");
          console.log(response);

          const userInfo = {
            fullName: response.data.fullName || "",
            address: response.data.address || "",
            phone: response.data.phone || "",
          };

          setOrderInfo((prev) => ({ ...prev, ...userInfo }));

          // Tính phí ship nếu có đủ thông tin
          if (response.data.address) {
            calculateShippingFee({
              ...userInfo,
              shippingMethod: orderInfo.shippingMethod,
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        } finally {
          setLoadingUserInfo(false);
        }
      }
    };

    fetchUserShippingInfo();
  }, [isAuthenticated]);

  const handleConfirmAddress = async () => {
    if (!orderInfo.address.trim()) {
      setAddressConfirmed(false);
      return;
    }

    const response = await getDistance(orderInfo.address);
    const distance = response.rows[0].elements[0].distance.value / 1000;
    setOrderInfo((prev) => ({ ...prev, distance }));
    calculateShippingFee(distance);

    setAddressConfirmed(true);
  };

  const calculateShippingFee = (distance) => {
    let shippingFee = 0;

    // Tính phí ship dựa trên khoảng cách
    if (distance < 2) {
      shippingFee = 15000; // Phí ship cho khoảng cách < 2km
    } else if (distance >= 2 && distance < 4) {
      shippingFee = 20000; // Phí ship cho khoảng cách 2-4km
    } else if (distance >= 4 && distance < 8) {
      shippingFee = 30000; // Phí ship cho khoảng cách 4-8km
    } else if (distance >= 8 && distance < 10) {
      shippingFee = 45000; // Phí ship cho khoảng cách 8-10km
    } else {
      shippingFee = 80000; // Phí ship cho khoảng cách > 10km
    }

    setShippingFee(shippingFee);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { fullName, address, phone } = orderInfo;
    if (!fullName || !address || !phone) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return false;
    }

    // Validate phone number (10-11 digits)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ (cần 10-11 chữ số)!");
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const selectedCartItems = await getSelectedItems();
      if (selectedCartItems.length === 0) {
        alert("Chọn ít nhất 1 sản phẩm!");
        navigate("/cart");
        return;
      }

      const orderData = {
        items: selectedCartItems.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        user: orderInfo.fullName,
        shippingAddress: {
          fullName: orderInfo.fullName,
          address: orderInfo.address,
          phone: orderInfo.phone,
          district: "a",
          ward: "a",
          city: "a",
        },
        paymentMethod: orderInfo.paymentMethod,
        shippingMethod: orderInfo.shippingMethod,
        totalItemsPrice: calculateTotal(),
        shippingPrice: shippingFee,
        amount: calculateTotal() + shippingFee,
      };
      const response2 = await createOrder(orderData);
      console.log(response2);

      if (orderInfo.paymentMethod === "cod") {
        navigate("/orders/" + response2.data.id);
        toast.success("Đặt hàng thành công");
        // navigate("/products");
        clearCart();
      } else if (orderInfo.paymentMethod === "zalopay") {
        const response = await api.post("zalopay/payment", orderData);
        console.log("response", response.data);
        const order_url = response.data.result.order_url;
        const app_trans_id = response.data.app_trans_id;

        window.open(order_url, "_blank");

        const intervalId = setInterval(async () => {
          try {
            const checkRes = await api.post("/zalopay/check-status-order", {
              app_trans_id,
            });

            console.log(checkRes.data);
            if (checkRes.data.return_code === 1) {
              toast.success("Đặt hàng thành công");
              clearInterval(intervalId);
              toast.success(checkRes.data.return_message);
              clearCart();

              setTimeout(async () => {
                await Promise.all(
                  selectedItems.map((element) =>
                    updateProduct(element.id, {
                      soldCount: element.soldCount + 1,
                    })
                  )
                );
                navigate("/products");
              }, 1500);
            } else if (checkRes.data.return_code === 2) {
              clearInterval(intervalId);
              alert(checkRes.data.return_message);
            }
          } catch (err) {
            clearInterval(intervalId);
            toast.warning(checkRes.data.return_message);
          }
        }, 3000);
      } else {
        toast.warning("Hiện chưa hỗ trợ phương thức này");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const selectedItems = getSelectedItems();

  return (
    <div className="checkout-page-container">
      <div className="checkout-page-header">
        <h1 className="checkout-page-title">
          <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
          Thanh toán đơn hàng
        </h1>
        <button
          className="back-to-cart-button"
          onClick={() => navigate("/cart")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại giỏ hàng
        </button>
      </div>

      <div className="checkout-page-content">
        {loadingUserInfo ? (
          <div className="loading-container">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              className="text-blue-500"
            />
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <div className="checkout-page-layout">
            <div className="checkout-page-form-section">
              <form onSubmit={handleSubmitOrder}>
                {/* Phần thông tin giao hàng */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="section-icon"
                    />
                    Thông tin giao hàng
                  </h2>
                  <div className="checkout-section-content">
                    <div className="checkout-form-row">
                      <div className="checkout-form-group">
                        <label>
                          Họ tên <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={orderInfo.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="checkout-form-group">
                        <label>
                          Số điện thoại <span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={orderInfo.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="checkout-form-group">
                      <label>
                        Địa chỉ <span className="required">*</span>
                      </label>
                      <div className="address-input-container">
                        <input
                          type="text"
                          name="address"
                          value={orderInfo.address}
                          onChange={handleInputChange}
                          required
                          placeholder="Số nhà, tên đường"
                        />
                        <button
                          type="button"
                          className="confirm-address-button"
                          onClick={() => handleConfirmAddress()}
                        >
                          Xác nhận
                        </button>
                      </div>
                      {addressConfirmed && (
                        <div className="address-confirmation-message">
                          Địa chỉ đã được xác nhận: {orderInfo.address}
                        </div>
                      )}
                    </div>
                    <div className="checkout-form-group">
                      <label>Khoảng cách giao hàng (km)</label>
                      <div className="distance-display">
                        {orderInfo.distance > 0
                          ? `${orderInfo.distance.toFixed(2)} km`
                          : "Chưa xác định"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="section-icon"
                    />
                    Phương thức thanh toán
                  </h2>
                  <div className="checkout-section-content">
                    <div className="payment-methods">
                      <div className="payment-method-item">
                        <label>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={orderInfo.paymentMethod === "cod"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">
                            Thanh toán khi nhận hàng (COD)
                          </span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="banking"
                            checked={orderInfo.paymentMethod === "banking"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">
                            Chuyển khoản ngân hàng
                          </span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="zalopay"
                            checked={orderInfo.paymentMethod === "zalopay"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">Zalopay</span>
                        </label>
                      </div>
                      <div className="payment-method-item">
                        <label>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={orderInfo.paymentMethod === "card"}
                            onChange={handleInputChange}
                          />
                          <span className="payment-method-name">
                            Thẻ tín dụng/Ghi nợ
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="checkout-section">
                  <h2 className="checkout-section-title">
                    <FontAwesomeIcon
                      icon={faNoteSticky}
                      className="section-icon"
                    />
                    Ghi chú đơn hàng
                  </h2>
                  <div className="checkout-section-content">
                    <div className="checkout-form-group">
                      <textarea
                        name="notes"
                        value={orderInfo.notes}
                        onChange={handleInputChange}
                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hay địa điểm giao hàng chi tiết hơn."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Phần tóm tắt đơn hàng */}
            <div className="checkout-page-summary-section">
              <div className="checkout-summary">
                <h2 className="checkout-summary-title">Tóm tắt đơn hàng</h2>
                <div className="checkout-summary-products">
                  {selectedItems.map((item) => (
                    <div
                      key={item.cartItemId || item.id}
                      className="checkout-summary-item"
                    >
                      <div className="checkout-summary-item-image">
                        <img src={item.image} alt={item.name} />
                        <span className="checkout-summary-item-quantity">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="checkout-summary-item-info">
                        <h3 className="checkout-summary-item-name">
                          {item.name}
                        </h3>
                        <p className="checkout-summary-item-options">
                          {item.selectedColor && (
                            <span>Màu: {item.selectedColor}</span>
                          )}
                          {item.selectedSize && (
                            <span>Size: {item.selectedSize}</span>
                          )}
                        </p>
                      </div>
                      <div className="checkout-summary-item-price">
                        {(item.price * item.quantity).toLocaleString()} ₫
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-totals">
                  <div className="checkout-summary-row">
                    <span>Tạm tính</span>
                    <span>{calculateTotal().toLocaleString()} ₫</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{shippingFee.toLocaleString()} ₫</span>
                  </div>
                  <div className="checkout-summary-row total">
                    <span>Tổng cộng</span>
                    <span>
                      {(calculateTotal() + shippingFee).toLocaleString()} ₫
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-submit-button"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>Đặt hàng ngay</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
