import { useCart } from "../context/CartContext";
import axios from "axios";

const handleCheckout = async () => {
    try {
        const res = await axios.post("http://localhost:3001/api/orders", {
            items: cart,             // từ useCart()
            total: calculateTotal()
        });
        alert("Đặt hàng thành công!");
    } catch (err) {
        alert("Lỗi khi đặt hàng: " + err.message);
    }
};

const CheckoutPage = () => {
    const { calculateTotal, applyDiscount, setShippingFee } = useCart();
    return (
        <div className="p-6 max-w-4xl m x-auto bg-white shadow-lg rounded-lg">
            
            <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
            <input type="text" placeholder="Mã giảm giá" className="border p-2 w-full mb-2" onBlur={(e) => applyDiscount(e.target.value)} />
            <input type="number" placeholder="Phí vận chuyển" className="border p-2 w-full mb-2" onBlur={(e) => setShippingFee(parseInt(e.target.value))} />
            <h2 className="text-lg font-bold">Tổng tiền sau giảm giá: {calculateTotal()} VND</h2>
            <button onClick={handleCheckout} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Đặt hàng</button>
        </div>
    );
};
export default CheckoutPage;
