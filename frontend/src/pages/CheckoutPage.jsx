import { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/css/CheckoutPage.css";

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
            navigate("/");
        } catch (err) {
            alert("Lỗi khi đặt hàng: " + err.message);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-empty">
                <h1>Giỏ hàng trống</h1>
                <button onClick={() => navigate("/")} className="checkout-back-btn">
                    Quay lại mua sắm
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-wrapper">
            <h1 className="checkout-title">Thanh toán</h1>
            
            <div className="checkout-section">
                <h2>Thông tin giao hàng</h2>
                <div className="checkout-grid">
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Họ tên" 
                        className="checkout-input"
                        value={shippingInfo.name}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="text" 
                        name="phone" 
                        placeholder="Số điện thoại" 
                        className="checkout-input"
                        value={shippingInfo.phone}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        className="checkout-input checkout-input-full"
                        value={shippingInfo.email}
                        onChange={handleInputChange} 
                    />
                    <input 
                        type="text" 
                        name="address" 
                        placeholder="Địa chỉ" 
                        className="checkout-input checkout-input-full"
                        value={shippingInfo.address}
                        onChange={handleInputChange} 
                    />
                </div>
            </div>
            
            <div className="checkout-section">
                <h2>Giỏ hàng của bạn</h2>
                <div className="checkout-cart-list">
                    {cart.map(item => (
                        <div key={item.id} className="checkout-cart-item">
                            <img src={item.image} alt={item.name} className="checkout-cart-img" />
                            <div className="checkout-cart-info">
                                <h3>{item.name}</h3>
                                <p>Số lượng: {item.quantity} x {item.price.toLocaleString()} VND</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="checkout-section">
                <h2>Phí vận chuyển</h2>
                
                    <input 
                        type="number" 
                        placeholder="Phí vận chuyển" 
                        className="checkout-input"
                        defaultValue={0}
                        onBlur={(e) => setShippingFee(parseInt(e.target.value) || 0)} 
                    />
                    <></>
                <h2>Mã giảm giá</h2>
                    <input 
                        type="text" 
                        placeholder="Mã giảm giá" 
                        className="checkout-input"
                        onBlur={(e) => applyDiscount(e.target.value)} 
                    />
                
            </div>

            <div className="checkout-footer">
                <div className="checkout-total">
                    Tổng tiền: <span>{calculateTotal().toLocaleString()} VND</span>
                </div>
                <button 
                    onClick={handleCheckout} 
                    className="checkout-order-btn"
                >
                    Đặt hàng
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
