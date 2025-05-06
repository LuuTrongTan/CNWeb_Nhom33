import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Tạo instance của axios với cấu hình chung
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Thêm interceptor để gắn token vào header của mọi request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const CheckoutForm = ({ onCancel }) => {
    const { cart, calculateTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderInfo, setOrderInfo] = useState({
        fullName: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        phone: "",
        paymentMethod: "cod",
        notes: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderInfo(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { fullName, address, city, district, ward, phone } = orderInfo;
        if (!fullName || !address || !city || !district || !ward || !phone) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng!");
            return false;
        }

        // Validate phone number (10-11 digits)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            alert("Số điện thoại không hợp lệ (cần 10-11 chữ số)!");
            return false;
        }

        return true;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            
            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                items: cart.map(item => ({
                    product: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    color: item.selectedColor,
                    size: item.selectedSize
                })),
                shippingAddress: {
                    fullName: orderInfo.fullName,
                    address: orderInfo.address,
                    city: orderInfo.city,
                    district: orderInfo.district,
                    ward: orderInfo.ward,
                    phone: orderInfo.phone
                },
                paymentMethod: orderInfo.paymentMethod,
                notes: orderInfo.notes,
                totalItemsPrice: calculateTotal(),
                shippingPrice: 0, // Có thể thêm tính năng phí vận chuyển
                taxPrice: 0,      // Có thể thêm tính năng thuế
                discountPrice: 0  // Có thể thêm tính năng giảm giá
            };

            // Gửi request tạo đơn hàng
            const response = await axiosInstance.post("/orders", orderData);
            
            // Xử lý khi đặt hàng thành công
            alert("Đặt hàng thành công! Mã đơn hàng: " + response.data.id);
            clearCart();
            navigate("/orders/" + response.data.id);
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert("Có lỗi xảy ra khi đặt hàng: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-form">
            <h2 className="text-xl font-bold mb-4">Thông tin đặt hàng</h2>
            
            <form onSubmit={handleSubmitOrder}>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Thông tin giao hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="fullName" 
                                value={orderInfo.fullName}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={orderInfo.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="address" 
                                value={orderInfo.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="city" 
                                value={orderInfo.city}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="district" 
                                value={orderInfo.district}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="ward" 
                                value={orderInfo.ward}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" 
                                required
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="payment-method">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="cod" 
                                    checked={orderInfo.paymentMethod === "cod"}
                                    onChange={handleInputChange}
                                    className="mr-2" 
                                />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                            </label>
                        </div>
                        <div className="payment-method">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="banking" 
                                    checked={orderInfo.paymentMethod === "banking"}
                                    onChange={handleInputChange}
                                    className="mr-2" 
                                />
                                <span>Chuyển khoản ngân hàng</span>
                            </label>
                        </div>
                        <div className="payment-method">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="momo" 
                                    checked={orderInfo.paymentMethod === "momo"}
                                    onChange={handleInputChange}
                                    className="mr-2" 
                                />
                                <span>Ví điện tử MoMo</span>
                            </label>
                        </div>
                        <div className="payment-method">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value="card" 
                                    checked={orderInfo.paymentMethod === "card"}
                                    onChange={handleInputChange}
                                    className="mr-2" 
                                />
                                <span>Thẻ tín dụng/Ghi nợ</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Ghi chú đơn hàng</h3>
                    <textarea
                        name="notes"
                        value={orderInfo.notes}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn."
                    ></textarea>
                </div>
                
                <div className="order-summary mb-6">
                    <h3 className="text-lg font-semibold mb-2">Tóm tắt đơn hàng</h3>
                    <div className="bg-gray-50 p-4 rounded">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between py-2 border-b">
                                <div>
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                </div>
                                <span>{(item.price * item.quantity).toLocaleString()} VND</span>
                            </div>
                        ))}
                        <div className="flex justify-between py-2 font-bold">
                            <span>Tổng cộng:</span>
                            <span>{calculateTotal().toLocaleString()} VND</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                    >
                        Quay lại
                    </button>
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đặt hàng"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;