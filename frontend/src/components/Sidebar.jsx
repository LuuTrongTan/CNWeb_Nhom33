import { useState, useEffect, useContext } from "react";
import styles from "./styles/Sidebar.module.scss";
import { FilterContext } from "../context/FilterContext";

const sizes = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "29",
  "30",
  "31",
  "32",
  "33",
];
const colors = [
  {
    name: "Phối màu",
    color:
      "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)",
  },
  { name: "Đen", color: "#000" },
  { name: "Xám", color: "#808080" },
  { name: "Trắng", color: "#fff", border: "1px solid #ccc" },
  { name: "Be", color: "#F5E1C8" },
  { name: "Xanh lam", color: "#0047AB" },
  { name: "Xanh lá", color: "#2E8B57" },
  { name: "Xanh ngọc", color: "#20B2AA" },
  { name: "Đỏ", color: "#D22B2B" },
  { name: "Cam", color: "#FFA500" },
  { name: "Vàng", color: "#FFD700" },
  { name: "Tím", color: "#9370DB" },
  { name: "Nâu", color: "#8B4513" },
  { name: "Hồng", color: "#FF69B4" },
  { name: "Xanh sáng", color: "#00BFFF" },
  { name: "Xanh đậm", color: "#191970" },
  { name: "Đen xám", color: "#4F4F4F" },
];

const Sidebar = () => {
  const [showProducts, setShowProducts] = useState(true);
  const [showSizes, setShowSizes] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const { selectedFilter, setSelectedFilter } = useContext(FilterContext);

  const handleSizeButton = (size) => {
    setSelectedFilter((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size) // Bỏ nếu đã chọn
        : [...prev.sizes, size], // Thêm nếu chưa chọn
    }));
  };

  const handleColor = (nameColor) => {
    setSelectedFilter((prev) => ({
      ...prev,
      color: prev.color === nameColor ? "" : nameColor,
    }));
  };

  const handleProduct = (productName) => {
    setSelectedFilter((prev) => ({
      ...prev,
      product: prev.product === productName ? "" : productName,
    }));
  };

  // useEffect(() => {
  //   // console.log("Sizes selected:", chooseSize);
  //   // console.log("Color selected:", chooseColor);
  //   console.log("Product selected:", chooseProduct);
  // }, [chooseSize, chooseColor, chooseProduct]);

  return (
    <aside className={styles.sidebar}>
      {/* Nhóm sản phẩm */}
      <h3 onClick={() => setShowProducts(!showProducts)}>
        Nhóm sản phẩm
        <span className={`${styles.arrow} ${showProducts ? styles.open : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`${styles.dropdown} ${showProducts ? styles.open : ""}`}>
        <ul>
          {[
            "Jeans",
            "Tshirt",
            "Jogger",
            "Kaki",
            "Pants",
            "Shorts",
            "Longsleeve",
            "Polo",
            "Underwear",
            "Jacket",
            "Longpants",
            "Shirt",
            "Tanktop",
            "Sportswear",
          ].map((item) => (
            <li key={item}>
              <label>
                <input
                  type="radio"
                  name="clothing"
                  value={item}
                  onClick={() => handleProduct(item)}
                  checked={selectedFilter.product === item}
                  onChange={() => {}}
                />
                {item}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Kích cỡ */}
      <h3 onClick={() => setShowSizes(!showSizes)}>
        Kích cỡ
        <span className={`${styles.arrow} ${showSizes ? styles.open : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`${styles.dropdown} ${showSizes ? styles.open : ""}`}>
        <div className={styles.sizeGrid}>
          {sizes.map((size) => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${selectedFilter.sizes.includes(size) ? styles.activeSize : ""}`}
              onClick={() => handleSizeButton(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Màu sắc */}
      <h3 onClick={() => setShowColors(!showColors)}>
        Màu sắc
        <span className={`${styles.arrow} ${showColors ? styles.open : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`${styles.dropdown} ${showColors ? styles.open : ""}`}>
        <div className={styles.colorGrid}>
          {colors.map(({ name, color, border }) => (
            <div
              key={name}
              className={styles.colorItem}
              onClick={() => handleColor(name)}
            >
              <span
                className={`${styles.colorCircle} ${selectedFilter.color == name ? styles.activeColor : ""}`}
                style={{ background: color, border }}
              ></span>
              <p>{name}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
