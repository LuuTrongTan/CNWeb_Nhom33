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
import axios from "axios";
import { toast } from "react-hot-toast";

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
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", err);
        setError("Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.");
        toast.error("Không thể lấy thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    try {
      const response = await axios.patch(`/api/orders/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOrder(response.data);
      toast.success("Đơn hàng đã được hủy thành công");
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      toast.error(err.response?.data?.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <Link to="/account/orders" className="text-blue-600 hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
          Không tìm thấy thông tin đơn hàng
        </div>
        <Link to="/account/orders" className="text-blue-600 hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  // Tạo các bước trạng thái đơn hàng
  const orderSteps = [
    { status: 'pending', label: 'Đặt hàng thành công' },
    { status: 'processing', label: 'Đang xử lý' },
    { status: 'shipped', label: 'Đang vận chuyển' },
    { status: 'delivered', label: 'Đã giao hàng' }
  ];

  // Xác định bước hiện tại
  const getCurrentStep = () => {
    if (order.status === 'cancelled') {
      return -1; // Đơn hàng đã hủy
    }
    return orderSteps.findIndex(step => step.status === order.status);
  };

  const currentStep = getCurrentStep();

  return (
    <div className="order-detail-page max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Tiêu đề và trạng thái */}
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Chi tiết đơn hàng #{order._id.substring(0, 8)}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              {order.status === 'cancelled' ? (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Đã hủy
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
                }`}>
                  {order.status === 'pending' && 'Chờ xử lý'}
                  {order.status === 'processing' && 'Đang xử lý'}
                  {order.status === 'shipped' && 'Đang vận chuyển'}
                  {order.status === 'delivered' && 'Đã giao hàng'}
                </span>
              )}
            </div>
          </div>

          {/* Tiến trình đơn hàng */}
          {order.status !== 'cancelled' && (
            <div className="my-6">
              <div className="relative">
                {/* Đường kẻ nối các bước */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                
                {/* Đường kẻ đã hoàn thành */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2"
                  style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
                ></div>
                
                {/* Các điểm trạng thái */}
                <div className="relative flex justify-between">
                  {orderSteps.map((step, index) => (
                    <div key={step.status} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index <= currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                        {index <= currentStep ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs text-center mt-2 ${
                        index <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nếu đơn hàng đã bị hủy */}
          {order.status === 'cancelled' && (
            <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Đơn hàng đã bị hủy</span>
              </div>
              <p className="text-red-600 text-sm">
                Ngày hủy: {new Date(order.cancelledAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          )}

          {/* Nút hủy đơn hàng */}
          {(order.status === 'pending' || order.status === 'processing') && (
            <div className="mt-4">
              <button 
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>

        {/* Thông tin vận chuyển */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Thông tin vận chuyển</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Địa chỉ giao hàng</h3>
              <div className="mt-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phương thức vận chuyển</h3>
              <p className="mt-1">Giao hàng tiêu chuẩn</p>
              
              <h3 className="text-sm font-medium text-gray-500 mt-4">Phương thức thanh toán</h3>
              <p className="mt-1">
                {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                {order.paymentMethod === 'card' && 'Thanh toán bằng thẻ tín dụng'}
                {order.paymentMethod === 'banking' && 'Chuyển khoản ngân hàng'}
                {order.paymentMethod === 'momo' && 'Ví điện tử MoMo'}
              </p>
              
              <h3 className="text-sm font-medium text-gray-500 mt-4">Trạng thái thanh toán</h3>
              <p className="mt-1">
                {order.isPaid ? (
                  <span className="text-green-600 font-medium">Đã thanh toán</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Chưa thanh toán</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start py-3 border-b last:border-b-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded" 
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm text-gray-500">
                      {item.quantity} x {item.price.toLocaleString()}đ
                      {item.color && <span className="ml-2">| Màu: {item.color}</span>}
                      {item.size && <span className="ml-2">| Size: {item.size}</span>}
                    </div>
                    <div className="font-medium">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng hợp thanh toán */}
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Tổng thanh toán</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{order.totalItemsPrice.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span>{order.shippingPrice.toLocaleString()}đ</span>
            </div>
            {order.taxPrice > 0 && (
              <div className="flex justify-between">
                <span>Thuế:</span>
                <span>{order.taxPrice.toLocaleString()}đ</span>
              </div>
            )}
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{order.discountPrice.toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold mt-2">
              <span>Tổng cộng:</span>
              <span className="text-xl text-blue-600">{order.totalPrice.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/account/orders" className="text-blue-600 hover:underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage; 