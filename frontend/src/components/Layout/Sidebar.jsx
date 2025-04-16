import { useState, useEffect, useContext, useRef } from "react";
import "../../styles/css/Sidebar.css";
import { FilterContext } from "../../context/FilterContext";
import { getAllCategory } from "../../service/categoryAPI";

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
  const [categoryList, setCategoryList] = useState([]);
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

  const handleCategory = (categoryName) => {
    setSelectedFilter((prev) => ({
      ...prev,
      category: prev.category === categoryName ? "" : categoryName,
    }));
  };

  const isFetched = useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true; // Đánh dấu đã gọi API
      const getCategory = async () => {
        try {
          const data = await getAllCategory();
          setCategoryList(data);
          console.log(data);
        } catch (error) {
          console.error("Không thể lấy sản phẩm:", error);
        }
      };

      getCategory();
    }
  }, []);

  // useEffect(() => {
  //   // console.log("Sizes selected:", chooseSize);
  //   // console.log("Color selected:", chooseColor);
  //   console.log("Product selected:", chooseProduct);
  // }, [chooseSize, chooseColor, chooseProduct]);

  return (
    <aside className="sidebar">
      {/* Nhóm sản phẩm */}
      <h3 onClick={() => setShowProducts(!showProducts)}>
        Nhóm sản phẩm
        <span className={`arrow ${showProducts ? "open" : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`dropdown ${showProducts ? "open" : ""}`}>
        <ul>
          {categoryList.map((category) => (
            <li key={category._id}>
              <label>
                <input
                  type="radio"
                  name="clothing"
                  value={category}
                  onClick={() => handleCategory(category)}
                  checked={selectedFilter.category === category}
                  onChange={() => {}}
                />
                {category.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Kích cỡ */}
      <h3 onClick={() => setShowSizes(!showSizes)}>
        Kích cỡ
        <span className={`arrow ${showSizes ? "open" : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`dropdown ${showSizes ? "open" : ""}`}>
        <div className="size-grid">
          {sizes.map((size) => (
            <button
              key={size}
              className={`size-btn ${selectedFilter.sizes.includes(size) ? "active-size" : ""}`}
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
        <span className={`arrow ${showColors ? "open" : ""}`}>
          ▲
        </span>
      </h3>
      <div className={`dropdown ${showColors ? "open" : ""}`}>
        <div className="color-grid">
          {colors.map(({ name, color, border }) => (
            <div
              key={name}
              className="color-item"
              onClick={() => handleColor(name)}
            >
              <span
                className={`color-circle ${selectedFilter.color == name ? "active-color" : ""}`}
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
