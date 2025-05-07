import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import useOrderWebSocket from "../../hooks/useOrderWebSocket";
import OrderStatus from './OrderStatus';
import { vi } from 'date-fns/locale';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  // Sử dụng WebSocket để cập nhật trạng thái realtime
  useOrderWebSocket(orderId, (newStatus) => {
    if (order) {
      setOrder((prev) => ({
        ...prev,
        orderStatus: newStatus,
      }));
    }
  });

  const handleReturnRequest = async (reason) => {
    try {
      await axios.post(`/api/orders/${orderId}/return`, { reason });
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error("Error requesting return:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  // Hiển thị tiến trình đơn hàng
  const renderOrderProgress = () => {
    const statusSteps = [
      { key: 'pending', label: 'Chờ xác nhận' },
      { key: 'processing', label: 'Đang xử lý' },
      { key: 'shipped', label: 'Đang giao hàng' },
      { key: 'delivered', label: 'Đã giao hàng' }
    ];

    const currentIndex = statusSteps.findIndex(step => step.key === order.orderStatus);
    const isCancelled = order.orderStatus === 'cancelled';

    return (
      <div className="order-progress my-6">
        <h3 className="text-lg font-semibold mb-3">Tiến trình đơn hàng</h3>
        {isCancelled ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Đơn hàng đã bị hủy vào {formatDate(order.cancelledAt)}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center w-1/4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                  {index + 1}
                </div>
                <div className="text-center mt-2 text-sm">{step.label}</div>
                {index < statusSteps.length - 1 && (
                  <div className="relative w-full">
                    <div className={`absolute h-1 top-1/2 transform -translate-y-1/2 left-0 right-0 ${
                      index < currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-6 flex items-center"
      >
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Đơn hàng #{order._id.slice(-6)}
            </h1>
            <p className="text-gray-500">
              Đặt ngày {format(new Date(order.createdAt), "dd/MM/yyyy")}
            </p>
          </div>
          <OrderStatus status={order.orderStatus} />
        </div>

        {renderOrderProgress()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-500">
                      Số lượng: {item.quantity} x{" "}
                      {item.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Họ tên:</span>{" "}
                {order.shippingAddress.fullName}
              </p>
              <p>
                <span className="font-medium">Số điện thoại:</span>{" "}
                {order.shippingAddress.phone}
              </p>
              <p>
                <span className="font-medium">Địa chỉ:</span>{" "}
                {order.shippingAddress.address}
              </p>
              <p>
                <span className="font-medium">Khu vực:</span>{" "}
                {`${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
              </p>
            </div>

            {order.trackingNumber && (
              <div className="mt-4">
                <h3 className="font-medium">Thông tin vận chuyển</h3>
                <p>Đơn vị vận chuyển: {order.shippingProvider}</p>
                <p>Mã vận đơn: {order.trackingNumber}</p>
                <p>
                  Trạng thái:{" "}
                  {(order.shippingStatus === "pending" && "Chờ lấy hàng") ||
                    (order.shippingStatus === "picked_up" && "Đã lấy hàng") ||
                    (order.shippingStatus === "in_transit" &&
                      "Đang vận chuyển") ||
                    (order.shippingStatus === "delivered" && "Đã giao hàng") ||
                    (order.shippingStatus === "returned" && "Đã hoàn trả")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Tổng quan đơn hàng</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>
                {(order.totalAmount - order.shippingFee).toLocaleString(
                  "vi-VN"
                )}
                đ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span>{order.shippingFee.toLocaleString("vi-VN")}đ</span>
            </div>
            {order.discount && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá</span>
                <span>-{order.discount.amount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Tổng cộng</span>
              <span>{order.totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        {order.orderStatus === "delivered" && !order.returnRequest && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Yêu cầu đổi/trả</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const reason = e.target.reason.value;
                handleReturnRequest(reason);
              }}
            >
              <textarea
                name="reason"
                placeholder="Vui lòng nêu lý do yêu cầu đổi/trả"
                className="w-full p-2 border rounded-md mb-4"
                rows="4"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>
        )}

        {order.returnRequest && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-lg font-semibold mb-4">
              Trạng thái yêu cầu đổi/trả
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Trạng thái:</span>{" "}
                {(order.returnRequest.status === "pending" && "Chờ xử lý") ||
                  (order.returnRequest.status === "approved" &&
                    "Đã chấp nhận") ||
                  (order.returnRequest.status === "rejected" && "Đã từ chối") ||
                  (order.returnRequest.status === "completed" && "Hoàn tất")}
              </p>
              <p>
                <span className="font-medium">Lý do:</span>{" "}
                {order.returnRequest.reason}
              </p>
              <p>
                <span className="font-medium">Yêu cầu ngày:</span>{" "}
                {format(new Date(order.returnRequest.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
