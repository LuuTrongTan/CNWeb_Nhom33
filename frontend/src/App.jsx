// export default App
import ProductListScreen from "./pages/productScreen/ProductListScreen";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import EditProducts from "./pages/productScreen/EditProductScreen";
import AddProduct from "./pages/productScreen/AddProduct";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";

const App = () => {
  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white flex justify-between">
        <div className="flex">
          <Link to="/" className="mr-4 thanhcc">
            Trang chủ
          </Link>
          <Link to="/cart" className="mr-4 thanhcc">
            Giỏ hàng
          </Link>
          <Link to="/checkout" className="mr-4 thanhcc">
            Thanh toán
          </Link>
        </div>
        <div className="flex">
          <Link to="/product" className="mr-4 thanhcc">
            Quản lý sản phẩm
          </Link>
          <Link to="/add-product" className="thanhcc">
            Thêm sản phẩm
          </Link>
        </div>
      </nav>

      <Routes>
        {/* Trang người dùng */}
        <Route path="/" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* Trang quản trị */}
        <Route path="/product" element={<ProductListScreen />} />
        <Route path="/edit-products" element={<EditProducts />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<AddProduct />} />
      </Routes>

      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>&copy; 2025 Cửa hàng thời trang. All rights reserved.</p>
      </footer>
    </Router>
  );
};
export default App;
