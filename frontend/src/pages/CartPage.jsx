import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import CheckoutForm from "../components/Checkout/CheckoutForm";
import "../styles/css/CartPage.css";

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
    <div className="cartpage-container">
      <h1 className="cartpage-title">Giỏ hàng của bạn</h1>

      {cart.length === 0 ? (
        <div className="cartpage-empty">
          <i className="fa-solid fa-cart-shopping cartpage-empty-icon"></i>
          <p>Giỏ hàng của bạn đang trống!</p>
          <button className="cartpage-shop-btn" onClick={() => navigate("/")}>
            <i className="fa-solid fa-arrow-left"></i> Quay lại mua sắm
          </button>
        </div>
      ) : (
        <div className="cartpage-list">
          {cart.map((item) => (
            <div key={item.id} className="cartpage-item">
              <div className="cartpage-img-wrap">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cartpage-img"
                />
              </div>
              <div className="cartpage-info">
                <h3 className="cartpage-name">{item.name}</h3>
                <div className="cartpage-price">
                  {item.price.toLocaleString()}{" "}
                  <span className="cartpage-currency">VND</span>
                </div>
                <div className="cartpage-qty-wrap">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    className="cartpage-qty"
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cartpage-remove"
                    title="Xóa sản phẩm"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="cartpage-footer">
          <div className="cartpage-total">
            Tổng tiền: <span>{calculateTotal().toLocaleString()} VND</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="cartpage-checkout"
          >
            Tiến hành thanh toán <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
