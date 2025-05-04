import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OrderStatus from '../components/Order/OrderStatus';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Tạo instance axios với headers authorization
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders?page=${page}&limit=10`);
      setOrders(response.data.results);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      // Cập nhật lại danh sách đơn hàng
      fetchOrders();
      alert('Đã hủy đơn hàng thành công!');
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      alert('Lỗi khi hủy đơn hàng: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  if (loading && orders.length === 0) return (
    <div className="order-history p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      <div className="text-center py-10">Đang tải dữ liệu...</div>
    </div>
  );

  if (error && orders.length === 0) return (
    <div className="order-history p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );

  return (
    <div className="order-history p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{order._id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.totalPrice.toLocaleString()} VND</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatus status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Xem chi tiết
                      </Link>
                      {order.status === 'pending' && (
                        <button 
                          className="ml-4 text-red-600 hover:text-red-900"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Hủy đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination flex justify-center mt-6">
          <button 
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`mx-1 px-4 py-2 rounded ${
              page === 1 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Trước
          </button>
          
          <div className="mx-4 flex items-center">
            Trang {page} / {totalPages}
          </div>
          
          <button 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`mx-1 px-4 py-2 rounded ${
              page === totalPages 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;