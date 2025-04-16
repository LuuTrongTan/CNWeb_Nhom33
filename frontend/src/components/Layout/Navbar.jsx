import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="text-xl font-bold">
          Shop
        </Link>
      </div>
      <ul className="menu">
        <li>QUẦN ÁO</li>
        <li>GIÀY DÉP</li>
        <li>TRANG SỨC</li>
        <li>PHỤ KIỆN</li>
      </ul>
      <div className="actions">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm...         🔍"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="icon">
          <i className="fa-solid fa-user"></i>
        </div>
        <div className="icon">
          <i className="fa-solid fa-cart-shopping"></i>
          <div>
            <Link to="/cart" className="ml-4">
              Giỏ hàng
            </Link>
          </div>
          <span className="cart-count">0</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
