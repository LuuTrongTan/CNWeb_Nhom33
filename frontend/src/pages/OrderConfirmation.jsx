import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faHome, faShoppingBag, faMapMarkerAlt, faTruck, faMoneyBill, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { getOrderDetails } from "../services/order.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "../styles/css/OrderConfirmation.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm format ngày tháng, trả về ngày hiện tại nếu không có dữ liệu
  const formatDate = (dateString) => {
    if (!dateString) {
      // Nếu không có ngày tháng, sử dụng ngày hiện tại
      return format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi });
    }
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderDetails(orderId);
        console.log("Order details received:", orderData);
        
        // Kiểm tra dữ liệu phản hồi
        if (!orderData) {
          throw new Error("Không nhận được dữ liệu đơn hàng");
        }
        
        // Kiểm tra và đảm bảo có tất cả thông tin cần thiết
        if (!orderData.items || !orderData.shippingAddress) {
          throw new Error("Dữ liệu đơn hàng không đầy đủ");
        }
        
        // Đảm bảo tính tổng tiền nếu chưa có
        if (orderData.totalItemsPrice === undefined || orderData.totalAmount === undefined) {
          let totalItemsPrice = 0;
          if (orderData.items && orderData.items.length > 0) {
            totalItemsPrice = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            orderData.totalItemsPrice = totalItemsPrice;
          }
          if (orderData.shippingPrice !== undefined) {
            orderData.totalAmount = totalItemsPrice + orderData.shippingPrice;
          }
        }
        
        setOrder(orderData);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message || "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
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
        <div className="order-confirmation-date">
          <span>Ngày đặt hàng:</span>
          <strong>{formatDate(order.createdAt)}</strong>
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
        <Link to={`/orders/${orderId}`} className="order-confirmation-button primary">
          <FontAwesomeIcon icon={faShoppingBag} /> Xem chi tiết đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 