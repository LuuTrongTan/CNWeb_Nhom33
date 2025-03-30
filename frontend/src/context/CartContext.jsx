// CartContext.js - Quản lý giỏ hàng
import { createContext, useContext, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            return existing ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...prev, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };
    
    const updateQuantity = (id, quantity) => {
        setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    };
    
    const applyDiscount = (code) => {
        if (code === "SALE10") setDiscount(10); // Giảm 10%
        else setDiscount(0);
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return subtotal - (subtotal * discount / 100) + shippingFee;
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, applyDiscount, calculateTotal, setShippingFee }}>
            {children}
        </CartContext.Provider>
    );
};
