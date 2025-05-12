import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faCheck,
  faShoppingBag,
  faMapMarkerAlt,
  faTruck,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { getOrderDetails, cancelOrder } from "../../services/order.service";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "../../styles/css/Order/OrderDetail.css";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderDetails(orderId);
        console.log("Order details received:", orderData);

        if (!orderData) {
          throw new Error("Không nhận được dữ liệu đơn hàng");
        }

        setOrder(orderData.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err.message ||
            "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      const cancelReason = prompt(
        "Vui lòng nhập lý do hủy đơn hàng (không bắt buộc):"
      );

      try {
        console.log("Bắt đầu gửi yêu cầu hủy đơn hàng với ID:", orderId);
        setLoading(true);

        let response;

        if (isAuthenticated) {
          response = await cancelOrder(orderId, cancelReason);
        } else {
          const phone = prompt(
            "Vui lòng nhập số điện thoại đặt hàng để xác nhận:"
          );
          if (!phone) {
            setLoading(false);
            return;
          }

          response = await cancelOrder(
            orderId,
            cancelReason,
            order.orderNumber,
            phone
          );
        }

        console.log("Kết quả hủy đơn hàng:", response);

        const updatedOrder = await getOrderDetails(orderId);
        setOrder(updatedOrder.data);
        setLoading(false);
        alert("Đơn hàng đã được hủy thành công");
      } catch (error) {
        setLoading(false);
        console.error("Lỗi khi hủy đơn hàng:", error);

        if (error.response) {
          console.error("Thông tin phản hồi từ server:", error.response);

          if (error.response.status === 401) {
            alert(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc hủy bằng mã đơn hàng."
            );
            return;
          } else if (error.response.status === 403) {
            alert(
              "Thông tin xác thực không chính xác. Vui lòng kiểm tra lại số điện thoại."
            );
            return;
          }

          alert(
            `Không thể hủy đơn hàng. Lỗi: ${
              error.response.data?.message || error.message
            }`
          );
        } else {
          alert(`Không thể hủy đơn hàng. Lỗi: ${error.message}`);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log("Không có dữ liệu ngày:", dateString);
      return "N/A";
    }

    try {
      console.log("Dữ liệu ngày nhận được:", dateString);
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.error("Không thể chuyển đổi thành ngày hợp lệ:", dateString);
        return "N/A";
      }

      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error(
        "Lỗi khi format ngày:",
        error,
        "với dateString:",
        dateString
      );
      return "N/A";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const renderOrderProgress = () => {
    if (!order) return null;

    const statusSteps = [
      { key: "pending", label: "Chờ xác nhận" },
      { key: "processing", label: "Đang xử lý" },
      { key: "shipped", label: "Đang giao hàng" },
      { key: "delivered", label: "Đã giao hàng" },
    ];

    const currentIndex = statusSteps.findIndex(
      (step) => step.key === order.status
    );
    const isCancelled = order.status === "cancelled";

    return (
      <div className="order-progress">
        {isCancelled ? (
          <div className="order-cancelled-notice">
            <p>
              Đơn hàng đã bị hủy{" "}
              {order.cancelledAt && `vào ngày ${formatDate(order.cancelledAt)}`}
            </p>
            {order.cancelReason && <p>Lý do: {order.cancelReason}</p>}
          </div>
        ) : (
          <div className="progress-steps">
            {statusSteps.map((step, index) => (
              <div
                key={step.key}
                className={`progress-step ${
                  index <= currentIndex ? "active" : ""
                }`}
              >
                <div className="step-indicator">
                  {index <= currentIndex ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="step-label">{step.label}</div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`step-connector ${
                      index < currentIndex ? "active" : ""
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-error">
        <h2>Có lỗi xảy ra</h2>
        <p>{error || "Không tìm thấy đơn hàng"}</p>
        <button className="back-button" onClick={() => navigate("/orders")}>
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate("/orders")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
          </button>
          <h1>Chi tiết đơn hàng #{order.orderNumber}</h1>
          <p className="order-date">
            Đặt hàng ngày: {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="header-right">
          <div className={`order-status ${getStatusClass(order.status)}`}>
            {getStatusText(order.status)}
          </div>
          {(order.status === "pending" || order.status === "processing") && (
            <button className="cancel-order-button" onClick={handleCancelOrder}>
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      {renderOrderProgress()}

      <div className="order-detail-content">
        <div className="order-items-section">
          <h2>
            <FontAwesomeIcon icon={faShoppingBag} className="section-icon" />
            Sản phẩm đã đặt
          </h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="order-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="order-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-options">
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </p>
                  <p className="item-quantity">Số lượng: {item.quantity}</p>
                </div>
                <div className="order-item-price">
                  <p className="item-unit-price">
                    {item.price.toLocaleString()}đ
                  </p>
                  <p className="item-total-price">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-info-grid">
          <div className="shipping-info">
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="section-icon" />
              Thông tin giao hàng
            </h2>
            <div className="info-content">
              <p>
                <strong>Người nhận:</strong> {order.shippingAddress.fullName}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {order.shippingAddress.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {order.shippingAddress.address}
              </p>
            </div>
          </div>

          <div className="shipping-method">
            <h2>
              <FontAwesomeIcon icon={faTruck} className="section-icon" />
              Phương thức vận chuyển
            </h2>
            <div className="info-content">
              {order.shippingMethod === "standard" && (
                <p>Giao hàng tiêu chuẩn (3-5 ngày)</p>
              )}
              {order.shippingMethod === "fast" && (
                <p>Giao hàng nhanh (1-2 ngày)</p>
              )}
              {order.shippingMethod === "express" && (
                <p>Giao hàng hỏa tốc (Trong ngày)</p>
              )}
            </div>
          </div>

          <div className="payment-info">
            <h2>
              <FontAwesomeIcon icon={faMoneyBill} className="section-icon" />
              Phương thức thanh toán
            </h2>
            <div className="info-content">
              {order.paymentMethod === "cod" && (
                <p>Thanh toán khi nhận hàng (COD)</p>
              )}
              {order.paymentMethod === "banking" && (
                <p>Chuyển khoản ngân hàng</p>
              )}
              {order.paymentMethod === "momo" && <p>Ví điện tử Zalo</p>}
              {order.paymentMethod === "card" && <p>Thẻ tín dụng/Ghi nợ</p>}
              <p>
                <strong>Trạng thái thanh toán:</strong>{" "}
                {order.paymentMethod === "momo"
                  ? "Đã thanh toán"
                  : order.isPaid
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </p>

              {order.isPaid && order.paidAt && (
                <p>
                  <strong>Thanh toán vào:</strong> {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h2>Tổng quan đơn hàng</h2>
          <div className="order-summary-rows">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{order.totalItemsPrice.toLocaleString()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{order.shippingPrice.toLocaleString()}đ</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{order.totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
