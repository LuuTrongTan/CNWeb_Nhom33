import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders/my-orders");
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipping":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/products"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">
                    Đơn hàng #{order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Đặt ngày {format(new Date(order.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus === "processing" && "Đang xử lý"}
                  {order.orderStatus === "shipping" && "Đang giao"}
                  {order.orderStatus === "delivered" && "Đã giao"}
                  {order.orderStatus === "completed" && "Hoàn tất"}
                  {order.orderStatus === "cancelled" && "Đã hủy"}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity} x{" "}
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển:</span>
                  <span>{order.shippingFee.toLocaleString("vi-VN")}đ</span>
                </div>
                {order.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>
                      -{order.discount.amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold mt-2">
                  <span>Tổng cộng:</span>
                  <span>{order.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Link
                  to={`/orders/${order._id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Xem chi tiết
                </Link>
                {order.orderStatus === "delivered" && !order.returnRequest && (
                  <Link
                    to={`/orders/${order._id}/return`}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Yêu cầu đổi/trả
                  </Link>
                )}
              </div>

              {order.returnRequest && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium">Yêu cầu đổi/trả</p>
                  <p className="text-sm text-gray-500">
                    {order.returnRequest.reason}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      order.returnRequest.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.returnRequest.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : order.returnRequest.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.returnRequest.status === "pending" && "Chờ xử lý"}
                    {order.returnRequest.status === "approved" &&
                      "Đã chấp nhận"}
                    {order.returnRequest.status === "rejected" && "Đã từ chối"}
                    {order.returnRequest.status === "completed" && "Hoàn tất"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
