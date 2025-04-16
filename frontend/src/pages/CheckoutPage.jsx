import { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
    const { cart, calculateTotal, applyDiscount, setShippingFee } = useCart();
    const navigate = useNavigate();
    const [shippingInfo, setShippingInfo] = useState({
        name: "",
        address: "",
        phone: "",
        email: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async () => {
        try {
            // Kiểm tra thông tin
            if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
                alert("Vui lòng điền đầy đủ thông tin giao hàng!");
                return;
            }

            const res = await axios.post("http://localhost:3001/api/orders", {
                items: cart,
                total: calculateTotal(),
                shippingInfo
            });
            
            alert("Đặt hàng thành công!");
            // Chuyển về trang chủ và làm mới giỏ hàng
            navigate("/");
        } catch (err) {
            alert("Lỗi khi đặt hàng: " + err.message);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="empty-cart p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
                <button onClick={() => navigate("/")} className="back-to-shop px-4 py-2 bg-blue-500 text-white rounded">
                    Quay lại mua sắm
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
            
            <div className="shipping-info mb-6">
                <h2 className="text-lg font-semibold mb-2">Thông tin giao hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Họ tên" 
                        className="input-field border p-2 rounded"
                        value={shippingInfo.name}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="Số điện thoại" 
                        className="input-field border p-2 rounded"
                        value={shippingInfo.phone}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="input-field border p-2 rounded"
                        value={shippingInfo.email}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="text" 
                        name="address" 
                        placeholder="Địa chỉ" 
                        className="input-field border p-2 rounded md:col-span-2"
                        value={shippingInfo.address}
                        onChange={handleInputChange} 
                    />
                </div>
            </div>
            
            <div className="cart-summary mb-6">
                <h2 className="text-lg font-semibold mb-2">Giỏ hàng của bạn</h2>
                {cart.map(item => (
                    <div key={item.id} className="cart-item flex items-center border-b py-2">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                        <div className="ml-4">
                            <h3 className="font-medium">{item.name}</h3>
                            <p>Số lượng: {item.quantity} x {item.price.toLocaleString()} VND</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="discount-shipping mb-6">
                <h2 className="text-lg font-semibold mb-2">Mã giảm giá & Vận chuyển</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="Mã giảm giá" 
                        className="discount-input border p-2 rounded" 
                        onBlur={(e) => applyDiscount(e.target.value)} 
                    />
                    <input 
                        type="number" 
                        placeholder="Phí vận chuyển" 
                        className="shipping-input border p-2 rounded" 
                        defaultValue={0}
                        onBlur={(e) => setShippingFee(parseInt(e.target.value) || 0)} 
                    />
                </div>
            </div>

            <div className="order-total text-right">
                <h2 className="text-xl font-bold">Tổng tiền: {calculateTotal().toLocaleString()} VND</h2>
                <button 
                    onClick={handleCheckout} 
                    className="place-order-btn mt-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
