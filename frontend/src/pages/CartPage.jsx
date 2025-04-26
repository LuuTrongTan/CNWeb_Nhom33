import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import CheckoutForm from "../components/Checkout/CheckoutForm";

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
    const navigate = useNavigate();
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    
    const handleBuyNow = () => {
        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống!");
            return;
        }
        setShowCheckoutForm(true);
    };

    return (
        <div className="cart-container p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            
            <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h1>

            {cart.length === 0 ? <p>Giỏ hàng trống</p> : (
                cart.map(item => (
                    <div key={item.id} className="cart-item flex justify-between items-center border-b py-4">
                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover" />
                        <div className="flex-1 ml-4">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-gray-500">Giá: {item.price.toLocaleString()} VND</p>
                            <div className="flex items-center mt-2">
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    className="quantity-input border p-1 w-16" 
                                    onChange={e => updateQuantity(item.id, parseInt(e.target.value))} 
                                />
                                <button onClick={() => removeFromCart(item.id)} className="remove-btn ml-4 text-red-500">Xóa</button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className="cart-footer text-right mt-4">
                <h2 className="text-lg font-bold">Tổng tiền: {calculateTotal().toLocaleString()} VND</h2>
                {!showCheckoutForm ? (
                    <button onClick={handleBuyNow} className="checkout-btn mt-2 px-4 py-2 bg-blue-500 text-white rounded">Mua hàng</button>
                ) : null}
            </div>
            
            {showCheckoutForm && (
                <div className="checkout-form-container mt-8 border-t pt-4">
                    <CheckoutForm onCancel={() => setShowCheckoutForm(false)} />
                </div>
            )}
        </div>
    );
};

export default CartPage;
