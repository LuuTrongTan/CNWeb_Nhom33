import { useCart } from "../context/CartContext";


const CheckoutPage = () => {
    const { calculateTotal, applyDiscount, setShippingFee } = useCart();
    const handleOrder = () => {
        alert("Đặt hàng thành công!");
    };
    return (
        <div>
            <h1>Thanh toán</h1>
            <input type="text" placeholder="Mã giảm giá" onBlur={(e) => applyDiscount(e.target.value)} />
            <input type="number" placeholder="Phí vận chuyển" onBlur={(e) => setShippingFee(parseInt(e.target.value))} />
            <h2>Tổng tiền sau giảm giá: {calculateTotal()} VND</h2>
            <button onClick={handleOrder}>Đặt hàng</button>
        </div>
    );
};
export default CheckoutPage;
