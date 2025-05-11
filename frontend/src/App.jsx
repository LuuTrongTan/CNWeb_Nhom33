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
import OrderManagementPage from "./pages/Admin/OrderManagementPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ChangePasswordPage from "./pages/Auth/ChangePasswordPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProductManagement from "./pages/Admin/ProductManagement";
import AdminLayout from "./components/Layout/AdminLayout";
import AddProductPage from "./pages/Admin/AddProductPage";
import CategoryManagementPage from "./pages/Admin/CategoryManagementPage";

// Styles
import "./styles/css/App.css";
import "./styles/css/Order/order.css";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { FilterProvider } from "./context/FilterContext";
import { AxiosProvider } from "./context/AxiosContext";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <Router>
      <AxiosProvider>
        <AuthProvider>
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
                      element={<ProductPage key="products" tagCategory="" />}
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
                      element={<ProductPage key="ao" tagCategory="Áo" />}
                    />
                    <Route
                      path="products/quan/*"
                      element={<ProductPage key="quan" tagCategory="Quần" />}
                    />
                    <Route
                      path="products/giayvadep/*"
                      element={
                        <ProductPage key="giayvadep" tagCategory="Giày & Dép" />
                      }
                    />
                    <Route
                      path="products/phukien/*"
                      element={
                        <ProductPage key="phukien" tagCategory="Phụ kiện" />
                      }
                    />
                    <Route path="sale/*" element={<CategoryPage />} />
                    <Route path="moi/*" element={<CategoryPage />} />

                    {/* Giỏ hàng và Thanh toán */}
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route
                      path="/order-confirmation/:orderId"
                      element={<OrderConfirmation />}
                    />

                    {/* Tài khoản */}
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route
                      path="forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route
                      path="change-password"
                      element={<ChangePasswordPage />}
                    />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="don-hang" element={<OrderHistoryPage />} />
                    <Route
                      path="don-hang/:orderId"
                      element={<OrderDetailPage />}
                    />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="products/add" element={<AddProductPage />} />
                    <Route path="orders" element={<OrderManagementPage />} />
                    <Route
                      path="products/edit/:id"
                      element={<AddProductPage />}
                    />

                    <Route
                      path="categories"
                      element={<CategoryManagementPage />}
                    />

                    {/* User Routes */}
                    <Route path="orders" element={<OrderHistoryPage />} />

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
