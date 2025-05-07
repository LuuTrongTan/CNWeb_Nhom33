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
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Auth/ProfilePage';
import SettingsPage from './pages/Auth/SettingsPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/User/OrderHistoryPage';
import OrderDetailPage from './pages/User/OrderDetailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import BannerManagementPage from './pages/Admin/BannerManagementPage';
import AddEditBannerPage from './pages/Admin/AddEditBannerPage';
import AdminLayout from './components/Layout/AdminLayout';

// Styles
import './styles/css/App.css';

// Context Providers
import { CartProvider } from './context/CartContext';
import { FilterProvider } from './context/FilterContext';
import { AxiosProvider } from './context/AxiosContext';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <Router>
      <AxiosProvider>
        <AuthProvider>
          <CartProvider>
            <FilterProvider>
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
                    
                    {/* Tài khoản */}
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="don-hang" element={<OrderHistoryPage />} />
                    <Route path="don-hang/:orderId" element={<OrderDetailPage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="banners" element={<BannerManagementPage />} />
                    <Route path="banners/add" element={<AddEditBannerPage />} />
                    <Route path="banners/edit/:id" element={<AddEditBannerPage />} />
                    {/* Thêm các route Admin khác ở đây */}
                  </Route>
                </Routes>
              </div>
            </FilterProvider>
          </CartProvider>
        </AuthProvider>
      </AxiosProvider>
    </Router>
  );
};

export default App;
