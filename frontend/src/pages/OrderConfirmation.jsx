import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faHome, faShoppingBag, faMapMarkerAlt, faTruck, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../styles/css/OrderConfirmation.css";

// Tạo instance axios
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token xác thực
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-confirmation-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-error">
        <h2>Có lỗi xảy ra</h2>
        <p>{error || "Không tìm thấy đơn hàng"}</p>
        <div className="order-confirmation-actions">
          <Link to="/" className="order-confirmation-button">
            <FontAwesomeIcon icon={faHome} /> Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-header">
        <FontAwesomeIcon icon={faCheckCircle} className="order-confirmation-icon" />
        <h1>Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.</p>
        <div className="order-confirmation-number">
          <span>Mã đơn hàng:</span>
          <strong>{order.orderNumber}</strong>
        </div>
      </div>

      <div className="order-confirmation-content">
        <div className="order-confirmation-section">
          <h2>
            <FontAwesomeIcon icon={faShoppingBag} className="section-icon" />
            Thông tin đơn hàng
          </h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-image">
                  <img src={item.image} alt={item.name} />
                  <span className="order-item-quantity">{item.quantity}</span>
                </div>
                <div className="order-item-info">
                  <h3>{item.name}</h3>
                  <p>
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </p>
                </div>
                <div className="order-item-price">
                  {(item.price * item.quantity).toLocaleString()} ₫
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-confirmation-details">
          <div className="order-confirmation-section">
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
              Địa chỉ giao hàng
            </h2>
            <div className="order-address">
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.phone}</p>
              <p>
                {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
              </p>
            </div>
          </div>

          <div className="order-confirmation-section">
            <h2>
              <FontAwesomeIcon icon={faTruck} className="section-icon" />
              Phương thức vận chuyển
            </h2>
            <div className="order-shipping-method">
              {order.shippingMethod === 'standard' && <p>Giao hàng tiêu chuẩn (3-5 ngày)</p>}
              {order.shippingMethod === 'fast' && <p>Giao hàng nhanh (1-2 ngày)</p>}
              {order.shippingMethod === 'express' && <p>Giao hàng hỏa tốc (Trong ngày)</p>}
            </div>
          </div>

          <div className="order-confirmation-section">
            <h2>
              <FontAwesomeIcon icon={faMoneyBill} className="section-icon" />
              Phương thức thanh toán
            </h2>
            <div className="order-payment-method">
              {order.paymentMethod === 'cod' && <p>Thanh toán khi nhận hàng (COD)</p>}
              {order.paymentMethod === 'banking' && <p>Chuyển khoản ngân hàng</p>}
              {order.paymentMethod === 'momo' && <p>Ví điện tử MoMo</p>}
              {order.paymentMethod === 'card' && <p>Thẻ tín dụng/Ghi nợ</p>}
            </div>
          </div>
        </div>

        <div className="order-confirmation-summary">
          <div className="order-summary-row">
            <span>Tạm tính</span>
            <span>{order.totalItemsPrice.toLocaleString()} ₫</span>
          </div>
          <div className="order-summary-row">
            <span>Phí vận chuyển</span>
            <span>{order.shippingPrice.toLocaleString()} ₫</span>
          </div>
          <div className="order-summary-row total">
            <span>Tổng cộng</span>
            <span>{order.totalAmount.toLocaleString()} ₫</span>
          </div>
        </div>
      </div>

      <div className="order-confirmation-actions">
        <Link to="/" className="order-confirmation-button">
          <FontAwesomeIcon icon={faHome} /> Về trang chủ
        </Link>
        <Link to="/orders" className="order-confirmation-button primary">
          <FontAwesomeIcon icon={faShoppingBag} /> Xem đơn hàng của tôi
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 