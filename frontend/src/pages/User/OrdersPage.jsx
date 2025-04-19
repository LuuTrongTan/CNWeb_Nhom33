import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    
    useEffect(() => {
        fetchOrders();
    }, []);
    
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/orders", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setOrders(response.data.results);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", err);
            setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau!");
            toast.error("Lỗi khi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };
    
    // Lọc đơn hàng theo tab đang chọn
    const filteredOrders = orders.filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "processing") return order.status === "pending" || order.status === "processing";
        if (activeTab === "shipping") return order.status === "shipped";
        if (activeTab === "completed") return order.status === "delivered";
        if (activeTab === "cancelled") return order.status === "cancelled";
        return true;
    });
    
    // Hàm trả về label trạng thái đơn hàng
    const getStatusLabel = (status) => {
        switch (status) {
            case "pending": return "Chờ xử lý";
            case "processing": return "Đang xử lý";
            case "shipped": return "Đang vận chuyển";
            case "delivered": return "Đã giao hàng";
            case "cancelled": return "Đã hủy";
            default: return status;
        }
    };
    
    // Hàm trả về class cho badge trạng thái
    const getStatusClass = (status) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "shipped": return "bg-indigo-100 text-indigo-800";
            case "delivered": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    
    // Hàm tính toán tiến trình đơn hàng
    const calculateProgress = (status) => {
        switch (status) {
            case "pending": return 10;
            case "processing": return 30;
            case "shipped": return 70;
            case "delivered": return 100;
            case "cancelled": return 0;
            default: return 0;
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
            <div className="max-w-6xl mx-auto p-6 text-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
                <button 
                    onClick={fetchOrders} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }
    
    return (
        <div className="orders-page max-w-6xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Đơn hàng của tôi</h1>
            
            {/* Tabs */}
            <div className="mb-6 border-b">
                <nav className="flex flex-wrap -mb-px">
                    <button
                        className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "all"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "processing"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("processing")}
                    >
                        Đang xử lý
                    </button>
                    <button
                        className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "shipping"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("shipping")}
                    >
                        Đang vận chuyển
                    </button>
                    <button
                        className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "completed"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Hoàn thành
                    </button>
                    <button
                        className={`mr-8 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "cancelled"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab("cancelled")}
                    >
                        Đã hủy
                    </button>
                </nav>
            </div>
            
            {/* Danh sách đơn hàng */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
                    <p className="mt-1 text-gray-500">Bạn chưa có đơn hàng nào trong danh mục này.</p>
                    <div className="mt-6">
                        <Link
                            to="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {/* Danh sách đơn hàng trên thiết bị lớn */}
                    <table className="min-w-full hidden md:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã đơn hàng
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày đặt
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium">#{order._id.substring(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            {order.status !== 'cancelled' && (
                                                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
                                                    <div 
                                                        className="bg-blue-600 h-2.5 rounded-full" 
                                                        style={{ width: `${calculateProgress(order.status)}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-medium">{order.totalPrice.toLocaleString()}đ</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link 
                                            to={`/account/orders/${order._id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Danh sách đơn hàng trên thiết bị di động */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">#{order._id.substring(0, 8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs leading-none font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                
                                {order.status !== 'cancelled' && (
                                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full" 
                                            style={{ width: `${calculateProgress(order.status)}%` }}
                                        ></div>
                                    </div>
                                )}
                                
                                <div className="mt-3 flex justify-between items-center">
                                    <p className="font-medium">Tổng: {order.totalPrice.toLocaleString()}đ</p>
                                    <Link 
                                        to={`/account/orders/${order._id}`}
                                        className="text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage; 