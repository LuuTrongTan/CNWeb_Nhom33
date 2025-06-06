import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import core styles
import "./styles/scss/main.scss";
import "./styles/css/index.css";
import "./styles/css/App.css";

// Import component styles
import "./styles/css/Navbar.css";
import "./styles/css/ProductCard.css";

// Import icon library
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import providers
import { CartProvider } from "./context/CartContext";
import { AxiosProvider } from "./context/AxiosContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AxiosProvider>
      <AuthProvider>
        <CartProvider>
          <App />
          <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </CartProvider>
      </AuthProvider>
    </AxiosProvider>
  </StrictMode>
);
