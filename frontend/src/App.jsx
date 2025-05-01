// export default App
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './components/Layout/MainLayout';

// Pages
import Home from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import SettingsPage from './pages/Auth/SettingsPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/User/OrderHistoryPage';
import OrderDetailPage from './pages/User/OrderDetailPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import BannerManagementPage from './pages/Admin/BannerManagementPage';
import AddEditBannerPage from './pages/Admin/AddEditBannerPage';
import AdminLayout from './components/Layout/AdminLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';

// Styles
import './styles/css/App.css';

// Context Providers
import { CartProvider } from './context/CartContext';
import { FilterProvider } from './context/FilterContext';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Trang chính */}
          <Route index element={<Home />} />
          
          {/* Sản phẩm */}
          <Route path="products" element={<ProductPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          
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
          
          {/* Auth Routes */}
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="don-hang" element={<OrderHistoryPage />} />
            <Route path="don-hang/:orderId" element={<OrderDetailPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="banners" element={<BannerManagementPage />} />
            <Route path="banners/add" element={<AddEditBannerPage />} />
            <Route path="banners/edit/:id" element={<AddEditBannerPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
