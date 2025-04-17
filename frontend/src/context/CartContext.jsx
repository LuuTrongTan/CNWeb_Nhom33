import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm lấy giỏ hàng từ localStorage khi component mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Lưu giỏ hàng vào localStorage khi thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            return existing 
                ? prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) 
                : [...prev, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };
    
    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
        }
    };
    
    const applyDiscount = (code) => {
        if (code === "SALE10") setDiscount(10); // Giảm 10%
        else setDiscount(0);
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return subtotal - (subtotal * discount / 100) + shippingFee;
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    // Tạo đơn hàng với backend API
    const createOrder = async (shippingInfo) => {
        try {
            setLoading(true);
            setError(null);
            
            const orderData = {
                items: cart,
                total: calculateTotal(),
                shippingInfo
            };
            
            const response = await axios.post('/api/orders', orderData);
            
            // Xóa giỏ hàng sau khi đặt hàng thành công
            clearCart();
            
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi tạo đơn hàng');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Thanh toán qua Stripe
    const processPayment = async (shippingInfo) => {
        try {
            setLoading(true);
            setError(null);
            
            const paymentData = {
                items: cart,
                total: calculateTotal(),
                shippingInfo
            };
            
            const response = await axios.post('/api/checkout', paymentData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi khi xử lý thanh toán');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            applyDiscount, 
            calculateTotal, 
            setShippingFee,
            createOrder,
            processPayment,
            clearCart,
            loading,
            error
        }}>
            {children}
        </CartContext.Provider>
    );
};