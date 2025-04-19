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
import OrdersPage from './pages/User/OrdersPage';
import OrderDetailPage from './pages/User/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

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
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <FilterProvider>
            <div className="App">
              {/* Toast notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              
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
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                  
                  {/* Tài khoản */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="account/profile" element={<ProfilePage />} />
                  <Route path="account/settings" element={<SettingsPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="account/orders" element={<OrdersPage />} />
                  <Route path="account/orders/:orderId" element={<OrderDetailPage />} />
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
    </Router>
  );
};

export default App;
