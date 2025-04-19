import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                if (!orderId) return;
                
                setLoading(true);
                const response = await axios.get(`/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setOrder(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin đơn hàng:", err);
                setError("Không thể lấy thông tin đơn hàng. Vui lòng kiểm tra lại!");
                toast.error("Lỗi khi lấy thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    {error || "Không tìm thấy thông tin đơn hàng"}
                </div>
                <div className="mt-6">
                    <Link to="/" className="text-blue-600 hover:underline">
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="order-success-page bg-gray-50 min-h-screen py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {/* Phần header */}
                <div className="p-6 bg-green-50 border-b border-green-100 text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Đặt hàng thành công!</h1>
                    <p className="text-gray-600 mt-2">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi</p>
                </div>

                {/* Thông tin đơn hàng */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">Mã đơn hàng: #{order._id.substring(0, 8)}</h2>
                            <p className="text-gray-500 text-sm">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {order.status === 'pending' && 'Chờ xử lý'}
                                {order.status === 'processing' && 'Đang xử lý'}
                                {order.status === 'shipped' && 'Đang vận chuyển'}
                                {order.status === 'delivered' && 'Đã giao hàng'}
                            </span>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="mb-6">
                        <h3 className="text-md font-semibold mb-3">Sản phẩm đã đặt:</h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-start border-b pb-4 last:border-b-0 last:pb-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                    <div className="ml-4 flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <div className="text-sm text-gray-500">
                                            {item.quantity} x {item.price.toLocaleString()}đ
                                            {item.color && <span className="ml-2">| Màu: {item.color}</span>}
                                            {item.size && <span className="ml-2">| Size: {item.size}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()}đ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thông tin giao hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-md font-semibold mb-2">Thông tin giao hàng:</h3>
                            <div className="text-gray-700">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.phone}</p>
                                <p>{order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold mb-2">Phương thức thanh toán:</h3>
                            <p className="text-gray-700">
                                {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                                {order.paymentMethod === 'card' && 'Thẻ tín dụng/ghi nợ'}
                                {order.paymentMethod === 'banking' && 'Chuyển khoản ngân hàng'}
                                {order.paymentMethod === 'momo' && 'Ví MoMo'}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                {order.paymentMethod === 'cod' ? (
                                    'Bạn sẽ thanh toán khi nhận được hàng'
                                ) : (
                                    order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Tổng cộng */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-sm">
                            <span>Tạm tính:</span>
                            <span>{order.totalItemsPrice.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                            <span>Phí vận chuyển:</span>
                            <span>{order.shippingPrice.toLocaleString()}đ</span>
                        </div>
                        {order.discountPrice > 0 && (
                            <div className="flex justify-between items-center text-sm mt-1 text-green-600">
                                <span>Giảm giá:</span>
                                <span>-{order.discountPrice.toLocaleString()}đ</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center font-bold mt-3 text-lg">
                            <span>Tổng cộng:</span>
                            <span className="text-blue-600">{order.totalPrice.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>

                {/* Hướng dẫn tiếp theo */}
                <div className="p-6 bg-gray-50 text-center">
                    <p className="text-gray-700 mb-4">
                        Chúng tôi sẽ thông báo cho bạn khi đơn hàng được vận chuyển. Bạn có thể theo dõi trạng thái đơn hàng trong trang "Đơn hàng của tôi".
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <Link
                            to={`/account/orders/${order._id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Xem chi tiết đơn hàng
                        </Link>
                        <Link
                            to="/account/orders"
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                            Xem tất cả đơn hàng
                        </Link>
                        <Link
                            to="/"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage; 