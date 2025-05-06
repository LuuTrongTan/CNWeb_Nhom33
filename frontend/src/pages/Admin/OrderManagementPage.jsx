import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import OrderStatus from '../../components/Order/OrderStatus';
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

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/admin/orders?page=${page}&limit=10`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const response = await api.get(url);
      setOrders(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Cập nhật trạng thái trong state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert('Cập nhật trạng thái đơn hàng thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      alert('Lỗi khi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  if (loading && orders.length === 0) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      <div className="text-center py-10">Đang tải dữ liệu...</div>
    </div>
  );

  if (error && orders.length === 0) return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
      
      <div className="mb-4 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded p-2"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
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
                  Thanh toán
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{order._id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shippingAddress?.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.totalPrice?.toLocaleString()} VND</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatus status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select 
                        className="border rounded p-1 mr-2"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <Link 
                        to={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default OrderManagementPage; 