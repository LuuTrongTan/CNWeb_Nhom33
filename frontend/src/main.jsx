import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { AxiosProvider } from './context/AxiosContext';

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
import { FilterProvider } from "./context/FilterContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AxiosProvider>
          <AuthProvider>
            <CartProvider>
              <FilterProvider>
                <App />
              </FilterProvider>
            </CartProvider>
          </AuthProvider>
        </AxiosProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
