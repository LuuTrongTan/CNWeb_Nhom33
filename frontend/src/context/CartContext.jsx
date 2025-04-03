import { createContext, useState } from "react";

// 1️⃣ Tạo Context
export const CartContext = createContext();

// 2️⃣ Tạo Provider để bọc toàn bộ ứng dụng
export const CartProvider = ({ children }) => {
  // State giỏ hàng (mảng chứa các sản phẩm)
  const [cart, setCart] = useState([]);

  // 3️⃣ Hàm thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCart([...cart, product]); 
  };

  // 4️⃣ Hàm xóa một sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // 5️⃣ Hàm xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
  };

  // 6️⃣ Cung cấp state và hàm cho component con
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
