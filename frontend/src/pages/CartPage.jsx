import { useCart } from "../context/CartContext";

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h1>
            {cart.length === 0 ? <p>Giỏ hàng trống</p> : cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b py-4">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover" />
                    <div className="flex-1 ml-4">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-500">Giá: {item.price} VND</p>
                        <div className="flex items-center mt-2">
                            <input type="number" value={item.quantity} className="border p-1 w-16" onChange={e => updateQuantity(item.id, parseInt(e.target.value))} />
                            <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500">Xóa</button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="text-right mt-4">
                <h2 className="text-lg font-bold">Tổng tiền: {calculateTotal()} VND</h2>
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Tiến hành thanh toán</button>
            </div>
        </div>
    );
};
export default CartPage;
