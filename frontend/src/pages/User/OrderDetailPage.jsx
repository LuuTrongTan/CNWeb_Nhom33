import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSpinner, 
  faTimes, 
  faCheck, 
  faTruck, 
  faInfoCircle,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faCreditCard,
  faBoxOpen,
  faShoppingBag,
  faPrint,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { getOrderById, cancelOrder } from '../../service/orderAPI';
import '../../styles/css/OrderDetail.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelLoading(true);
      await cancelOrder(orderId);
      // Cập nhật trạng thái đơn hàng sau khi hủy thành công
      fetchOrderDetails();
      setShowCancelModal(false);
    } catch (err) {
      setError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Đơn hàng #${order._id.slice(-6)}`,
        text: `Xem chi tiết đơn hàng #${order._id.slice(-6)}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Lỗi khi chia sẻ:', error));
    } else {
      // Sao chép URL vào clipboard nếu Web Share API không được hỗ trợ
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết đơn hàng vào clipboard');
    }
  };

  // Hàm chuyển đổi trạng thái đơn hàng sang tiếng Việt
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Hàm lấy icon cho trạng thái đơn hàng
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return faInfoCircle;
      case 'processing':
        return faBoxOpen;
      case 'shipped':
        return faTruck;
      case 'delivered':
        return faCheck;
      case 'cancelled':
        return faTimes;
      default:
        return faInfoCircle;
    }
  };

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Hàm định dạng số tiền
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm lấy text cho phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví điện tử MoMo';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-error">
        <p>{error}</p>
        <button className="retry-button" onClick={fetchOrderDetails}>Thử lại</button>
        <Link to="/don-hang" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <p>Không tìm thấy thông tin đơn hàng</p>
        <Link to="/don-hang" className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="order-detail-container" ref={printRef}>
      <div className="order-detail-header">
        <div className="header-left">
          <Link to="/don-hang" className="back-link no-print">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách
          </Link>
          <h1>Chi tiết đơn hàng #{order._id.slice(-6)}</h1>
          <p className="order-date">Đặt hàng ngày: {formatDate(order.createdAt)}</p>
        </div>
        <div className="header-right">
          <div className={`order-status ${getStatusColor(order.status)}`}>
            <FontAwesomeIcon icon={getStatusIcon(order.status)} />
            {getStatusText(order.status)}
          </div>
          <div className="order-actions-buttons no-print">
            <button className="action-btn print-btn" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} /> In đơn hàng
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              <FontAwesomeIcon icon={faShare} /> Chia sẻ
            </button>
            {(order.status === 'pending' || order.status === 'processing') && (
              <button 
                className="cancel-order-btn" 
                onClick={() => setShowCancelModal(true)}
              >
                <FontAwesomeIcon icon={faTimes} /> Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-info-section">
          <div className="timeline-section">
            <h2>Trạng thái đơn hàng</h2>
            <div className="order-timeline">
              <div className={`timeline-step ${order.status !== 'cancelled' ? 'active' : ''}`}>
                <div className="step-icon">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
                <div className="step-content">
                  <h4>Đặt hàng</h4>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              <div className={`timeline-step ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                <div className="step-icon">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <div className="step-content">
                  <h4>Xử lý</h4>
                  <p>{order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? formatDate(order.updatedAt) : '—'}</p>
                </div>
              </div>
              
              <div className={`timeline-step ${order.status === 'shipped' || order.status === 'delivered' ? 'active' : ''}`}>
                <div className="step-icon">
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <div className="step-content">
                  <h4>Giao hàng</h4>
                  <p>{order.status === 'shipped' || order.status === 'delivered' ? formatDate(order.updatedAt) : '—'}</p>
                </div>
              </div>
              
              <div className={`timeline-step ${order.status === 'delivered' ? 'active' : ''}`}>
                <div className="step-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <div className="step-content">
                  <h4>Hoàn thành</h4>
                  <p>{order.deliveredAt ? formatDate(order.deliveredAt) : '—'}</p>
                </div>
              </div>
              
              {order.status === 'cancelled' && (
                <div className="timeline-step cancelled active">
                  <div className="step-icon">
                    <FontAwesomeIcon icon={faTimes} />
                  </div>
                  <div className="step-content">
                    <h4>Đã hủy</h4>
                    <p>{order.cancelledAt ? formatDate(order.cancelledAt) : formatDate(order.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-details-grid">
            <div className="details-card shipping-info">
              <h3><FontAwesomeIcon icon={faMapMarkerAlt} /> Thông tin giao hàng</h3>
              <div className="card-content">
                <p><strong><FontAwesomeIcon icon={faUser} /> Người nhận:</strong> {order.shippingAddress.fullName}</p>
                <p><strong><FontAwesomeIcon icon={faPhone} /> Số điện thoại:</strong> {order.shippingAddress.phone}</p>
                <p><strong><FontAwesomeIcon icon={faMapMarkerAlt} /> Địa chỉ:</strong> {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                {order.trackingNumber && (
                  <p><strong>Mã vận đơn:</strong> {order.trackingNumber}</p>
                )}
                {order.shippingProvider && (
                  <p><strong>Đơn vị vận chuyển:</strong> {order.shippingProvider}</p>
                )}
              </div>
            </div>
            
            <div className="details-card payment-info">
              <h3><FontAwesomeIcon icon={faCreditCard} /> Thông tin thanh toán</h3>
              <div className="card-content">
                <p><strong>Phương thức:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
                <p><strong>Trạng thái:</strong> {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                {order.isPaid && order.paidAt && (
                  <p><strong>Thời gian thanh toán:</strong> {formatDate(order.paidAt)}</p>
                )}
                {order.paymentResult && order.paymentResult.id && (
                  <p><strong>Mã giao dịch:</strong> {order.paymentResult.id}</p>
                )}
              </div>
            </div>

            <div className="details-card order-summary">
              <h3><FontAwesomeIcon icon={faShoppingBag} /> Tóm tắt đơn hàng</h3>
              <div className="card-content">
                <div className="summary-row">
                  <span>Tổng tiền sản phẩm:</span>
                  <span>{formatPrice(order.totalItemsPrice)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(order.shippingPrice)}</span>
                </div>
                {order.taxPrice > 0 && (
                  <div className="summary-row">
                    <span>Thuế:</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                )}
                {order.discountPrice > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(order.discountPrice)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Tổng thanh toán:</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Sản phẩm đã đặt</h2>
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div className="order-item" key={index}>
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <Link to={`/products/${item.product}`} className="item-name">{item.name}</Link>
                  {item.size && <p className="item-variant">Size: {item.size}</p>}
                  {item.color && <p className="item-variant">Màu: {item.color}</p>}
                  <div className="item-price">
                    <span>{formatPrice(item.price)}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                </div>
                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="order-actions no-print">
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
            {order.status === 'delivered' && (
              <Link to={`/danh-gia?order=${order._id}`} className="review-order-btn">
                Đánh giá sản phẩm
              </Link>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc chắn muốn hủy đơn hàng #{order._id.slice(-6)}?</p>
            <p className="modal-note">Lưu ý: Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                Không, giữ đơn hàng
              </button>
              <button 
                className="modal-btn confirm-btn" 
                onClick={handleCancelOrder}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTimes} /> Hủy đơn hàng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 