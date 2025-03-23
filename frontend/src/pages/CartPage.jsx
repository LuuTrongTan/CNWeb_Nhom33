// CartPage.jsx - Giao diện giỏ hàng
import { useCart } from "../context/CartContext";

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
    return (
        <div>
            <h1>Giỏ hàng</h1>
            {cart.length === 0 ? <p>Giỏ hàng trống</p> : cart.map(item => (
                <div key={item.id}>
                    <h3>{item.name}</h3>
                    <p>Giá: {item.price} VND</p>
                    <input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value))} />
                    <button onClick={() => removeFromCart(item.id)}>Xóa</button>
                </div>
            ))}
            <h2>Tổng tiền: {calculateTotal()} VND</h2>
        </div>
    );
};
export default CartPage;