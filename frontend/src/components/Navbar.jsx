import styles from "./styles/Navbar.module.scss";
import { useState } from "react";

const Navbar = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>TÊN WEB</div>
      <ul className={styles.menu}>
        <li>QUẦN ÁO</li>
        <li>GIÀY DÉP</li>
        <li>TRANG SỨC</li>
        <li>PHỤ KIỆN</li>
      </ul>
      <div className={styles.actions}>
        <div className={styles.search_bar}>
          <input
            // className={styles.}
            type="text"
            placeholder="Tìm kiếm sản phẩm...         🔍"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.icon}>
          <i className="fa-solid fa-user"></i>
        </div>
        <div className={styles.icon}>
          <i className="fa-solid fa-cart-shopping"></i>
          <span className={styles.cartCount}>0</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
