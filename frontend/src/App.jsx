// export default App
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductListScreen from "./pages/productScreen/ProductListScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditProducts from "./pages/productScreen/EditProductScreen";
import AddProduct from "./pages/productScreen/AddProduct";

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<ProductListScreen />} />
        <Route path="/edit-products" element={<EditProducts />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id?" element={<AddProduct />} />

        {/* Sau này có trang chỉnh sửa sản phẩm chi tiết */}
        {/* <Route path="/edit-product/:id" element={<EditProductDetail />} /> */}
      </Routes>
      {/* <Footer /> */}
    </Router>
  );
};

export default App;
