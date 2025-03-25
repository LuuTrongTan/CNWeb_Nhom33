import styles from "./styles/Sidebar.module.scss";

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
  return (
    <aside className={styles.sidebar}>
      <h3>Nhóm sản phẩm</h3>
      <ul>
        <li>
          <input type="checkbox" /> Quần Jean
        </li>
        <li>
          <input type="checkbox" /> Áo Thun
        </li>
        <li>
          <input type="checkbox" /> Quần Jogger
        </li>
        <li>
          <input type="checkbox" /> Áo Polo
        </li>
        <li>
          <input type="checkbox" /> Áo khoác
        </li>
      </ul>
      <div className={styles.filterSection}>
        <h3>Kích cỡ</h3>
        <div className={styles.sizeGrid}>
          {sizes.map((size) => (
            <button key={size} className={styles.sizeBtn}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Màu sắc</h3>
        <div className={styles.colorGrid}>
          {colors.map(({ name, color, border }) => (
            <div key={name} className={styles.colorItem}>
              <span
                className={styles.colorCircle}
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
