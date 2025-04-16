// export default App
import ProductListScreen from "./pages/productScreen/ProductListScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditProducts from "./pages/productScreen/EditProductScreen";
import AddProduct from "./pages/productScreen/AddProduct";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import "./styles/index.css"; // Import CSS vào toàn bộ ứng dụng
import CheckoutPage from "./pages/CheckoutPage";

const App = () => {
  return (
    <CartProvider>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/product" element={<ProductListScreen />} />
          <Route path="/edit-products" element={<EditProducts />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:id?" element={<AddProduct />} />

          {/* Sau này có trang chỉnh sửa sản phẩm chi tiết */}
          {/* <Route path="/edit-product/:id" element={<EditProductDetail />} /> */}
        </Routes>
        {/* <Footer /> */}
      </Router>
      <Router>
        <nav className="p-4 bg-gray-800 text-white flex justify-between">
          <Link to="/" className="mr-4 thanhcc">
            Trang chủ
          </Link>
          <Link to="/cart" className="thanhcc">
            Giỏ hàng
          </Link>
          <Link to="/checkout" className="thanhcc">
            Thanh Toan
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>

        <footer className="bg-gray-800 text-white p-4 text-center mt-8">
          <p>&copy; 2025 Cửa hàng thời trang. All rights reserved.</p>
        </footer>
      </Router>
    </CartProvider>
  );
};
export default App;
