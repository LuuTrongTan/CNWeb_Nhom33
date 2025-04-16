import { StrictMode } from "react";
import { createRoot, ReactDOM } from "react-dom/client";
import App from "./App.jsx";
import "./main.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";

import { CartProvider } from "./context/CartContext";
import "./styles/index.css"; // Import CSS vào toàn bộ ứng dụng

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
