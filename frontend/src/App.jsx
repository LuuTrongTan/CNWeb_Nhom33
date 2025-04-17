// export default App
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './components/Layout/MainLayout';

// Pages
import Home from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
//import LoginPage from './pages/LoginPage';
//import RegisterPage from './pages/RegisterPage';
//import ProfilePage from './pages/ProfilePage';
//import SettingsPage from './pages/SettingsPage';

// Styles
import './styles/css/App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Trang chính */}
            <Route index element={<Home />} />
            
            {/* Sản phẩm */}
            <Route path="san-pham" element={<ProductPage />} />
            <Route path="san-pham/:id" element={<ProductDetailPage />} />
            
            {/* Danh mục */}
            <Route path="nu/*" element={<CategoryPage />} />
            <Route path="nam/*" element={<CategoryPage />} />
            <Route path="tre-em/*" element={<CategoryPage />} />
            <Route path="phu-kien/*" element={<CategoryPage />} />
            <Route path="sale/*" element={<CategoryPage />} />
            <Route path="moi/*" element={<CategoryPage />} />
            
            {/* Giỏ hàng và Thanh toán */}
            <Route path="gio-hang" element={<CartPage />} />
            <Route path="thanh-toan" element={<CheckoutPage />} />
            
            {/* Tài khoản */}
            {/* <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="yeu-thich" element={<Home />} /> */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
