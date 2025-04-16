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
//import ProductDetailPage from './pages/ProductDetailPage';
//import CategoryPage from './pages/CategoryPage';

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
            
           
            <Route path="thanh-toan" element={<CheckoutPage />} />
            
            {/* Danh mục sản phẩm */}
        
            
            {/* Tài khoản */}
            <Route path="tai-khoan/*" element={<Home />} />
            <Route path="yeu-thich" element={<Home />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
