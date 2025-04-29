// export default App
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ResetFilterOnRouteChange from "./context/ResetFilterOnRouteChange";

// Layouts
import MainLayout from "./components/Layout/MainLayout";

// Pages
import Home from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ProfilePage from "./pages/Auth/ProfilePage";
import SettingsPage from "./pages/Auth/SettingsPage";
import WishlistPage from "./pages/WishlistPage";
import OrderHistoryPage from "./pages/User/OrderHistoryPage";
import OrderDetailPage from "./pages/User/OrderDetailPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProductManagement from "./pages/Admin/ProductManagement";
import BannerManagementPage from "./pages/Admin/BannerManagementPage";
import AddEditBannerPage from "./pages/Admin/AddEditBannerPage";
import AdminLayout from "./components/Layout/AdminLayout";
import AddProductPage from "./pages/Admin/AddProductPage";

// Styles
import "./styles/css/App.css";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { FilterProvider } from "./context/FilterContext";

const App = () => {
  return (
    <Router>
      <CartProvider>
        <FilterProvider>
          <ResetFilterOnRouteChange />
          <div className="App">
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* Trang chính */}
                <Route index element={<Home />} />

                {/* Sản phẩm */}
                <Route
                  path="products"
                  element={<ProductPage tagCategory="" />}
                />
                <Route
                  path="products/:id"
                  element={<ProductDetailPage tagCategory="" />}
                />
                <Route
                  path="products/ao/:id"
                  element={<ProductDetailPage tagCategory="Áo" />}
                />
                <Route
                  path="products/quan/:id"
                  element={<ProductDetailPage tagCategory="Quần" />}
                />
                <Route
                  path="products/giayvadep/:id"
                  element={<ProductDetailPage tagCategory="Giày & Dép" />}
                />
                <Route
                  path="products/phukien/:id"
                  element={<ProductDetailPage tagCategory="Phụ kiện" />}
                />

                {/* Danh mục */}
                <Route
                  path="products/ao/*"
                  element={<ProductPage tagCategory="Áo" />}
                />
                <Route
                  path="products/quan/*"
                  element={<ProductPage tagCategory="Quần" />}
                />
                <Route
                  path="products/giayvadep/*"
                  element={<ProductPage tagCategory="Giày & Dép" />}
                />
                <Route
                  path="products/phukien/*"
                  element={<ProductPage tagCategory="Phụ kiện" />}
                />
                <Route path="sale/*" element={<CategoryPage />} />
                <Route path="moi/*" element={<CategoryPage />} />

                {/* Giỏ hàng và Thanh toán */}
                <Route path="cart" element={<CartPage />} />
                <Route path="thanh-toan" element={<CheckoutPage />} />

                {/* Tài khoản */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
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
                <Route path="products/add" element={<AddProductPage />} />
                <Route path="products/edit/:id" element={<AddProductPage />} />

                <Route path="banners" element={<BannerManagementPage />} />
                <Route path="banners/add" element={<AddEditBannerPage />} />
                <Route
                  path="banners/edit/:id"
                  element={<AddEditBannerPage />}
                />
                {/* Thêm các route Admin khác ở đây */}
              </Route>
            </Routes>
          </div>
        </FilterProvider>
      </CartProvider>
    </Router>
  );
};

export default App;
