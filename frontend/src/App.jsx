import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";

function App() {
    return (
        <CartProvider>
            <Router>
                <nav className="p-4 bg-gray-800 text-white flex justify-between">
                    <Link to="/" className="mr-4">Trang chủ</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                </Routes>
            </Router>
        </CartProvider>
    );
}

export default App;
