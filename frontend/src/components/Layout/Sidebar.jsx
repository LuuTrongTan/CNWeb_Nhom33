import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FilterContext } from "../../context/FilterContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/Sidebar.css";
import { getCategoryByTagName } from "../../service/categoryAPI";

const Sidebar = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedFilter,
    setSelectedFilter,
    resetFilters,
    addSizeFilter,
    setCategoryFilter,
    setColorFilter,
    setPriceFilter,
  } = useContext(FilterContext);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    size: true,
    color: true,
    price: true,
  });

  // Quản lý danh mục được mở rộng
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Danh mục sản phẩm

  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const colors = [
    { name: "Đen", code: "#000000" },
    { name: "Trắng", code: "#FFFFFF" },
    { name: "Đỏ", code: "#E53935" },
    { name: "Xanh dương", code: "#1E88E5" },
    { name: "Xanh lá", code: "#43A047" },
    { name: "Vàng", code: "#FDD835" },
    { name: "Hồng", code: "#EC407A" },
    { name: "Xám", code: "#757575" },
    { name: "Cam", code: "#FF9800" },
    { name: "Tím", code: "#7E57C2" },
    { name: "Xanh ngọc", code: "#00ACC1" },
    { name: "Be", code: "#D7CCC8" },
  ];

  const priceRanges = [
    { label: "Dưới 200.000đ", value: "under-200k", min: 0, max: 200000 },
    {
      label: "200.000đ - 500.000đ",
      value: "200k-500k",
      min: 200000,
      max: 500000,
    },
    {
      label: "500.000đ - 1.000.000đ",
      value: "500k-1m",
      min: 500000,
      max: 1000000,
    },
    {
      label: "1.000.000đ - 3.000.000đ",
      value: "1m-3m",
      min: 1000000,
      max: 3000000,
    },
    {
      label: "3.000.000đ - 5.000.000đ",
      value: "3m-5m",
      min: 3000000,
      max: 5000000,
    },
    {
      label: "Trên 5.000.000đ",
      value: "over-5m",
      min: 5000000,
      max: 999999999, // hoặc giá trần tùy bạn
    },
  ];

  const [categories, setCategories] = useState([
    {
      name: "Áo",
      subcategories: [],
    },
    {
      name: "Quần",
      subcategories: [],
    },
    {
      name: "Giày & Dép",
      subcategories: [],
    },
    {
      name: "Phụ kiện",
      subcategories: [],
    },
  ]);

  useEffect(() => {
    const getCategory = async () => {
      try {
        categories.map(async (category) => {
          const response = await getCategoryByTagName(category.name);
          setCategories((prevCategories) =>
            prevCategories.map((cat) => {
              if (cat.name === category.name) {
                return { ...cat, subcategories: response };
              }
              return cat;
            })
          );
        });

        // console.log("Dữ liệu sản phẩm:", response);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm");
        setLoading(false);
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    };

    getCategory();
  }, []);

  // Mở rộng hoặc thu gọn phần lọc
  const toggleFilter = (filterId) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  };

  // Mở rộng hoặc thu gọn danh mục
  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  // Xử lý khi chọn danh mục con
  const handleSubcategoryClick = (subcategory) => {
    console.log(subcategory);

    setSelectedFilter((prev) => ({
      ...prev,
      category: prev.category === subcategory ? null : subcategory,
    }));
  };

  // Xử lý khi chọn kích thước
  const handleSizeChange = (size) => {
    setSelectedFilter((prev) => {
      // Kiểm tra xem size đã được chọn chưa
      const sizeExists = prev.sizes.includes(size);

      // Nếu đã chọn, loại bỏ khỏi mảng; nếu chưa, thêm vào mảng
      const newSizes = sizeExists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];

      return {
        ...prev,
        sizes: newSizes,
      };
    });
  };

  useEffect(() => {
    console.log("Updated selectedFilter:", selectedFilter);
  }, [selectedFilter]);

  // Xử lý khi chọn màu sắc
  const handleColorChange = (color) => {
    setSelectedFilter((prev) => ({
      ...prev,
      color: prev.color === color ? "" : color,
    }));
  };

  const handlePriceChange = (priceRange) => {
    setSelectedFilter((prev) => {
      const isSame = prev.price?.value === priceRange.value;

      if (isSame) {
        // Nếu chọn lại cái cũ, set về giá trị mặc định
        return {
          ...prev,
          price: {
            value: "all",
            min: 0,
            max: 10000000,
          },
        };
      }

      // Cập nhật khoảng giá mới
      return {
        ...prev,
        price: priceRange,
      };
    });
  };

  // Hàm xử lý reset tất cả bộ lọc
  const handleResetFilters = () => {
    resetFilters();
  };

  // Ngăn chặn sự kiện click lan toả đến overlay
  const handleSidebarClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="sidebar" onClick={handleSidebarClick}>
      <div className="sidebar-header">
        <div className="sidebar-title-container">
          <h2 className="sidebar-title">Bộ lọc sản phẩm</h2>
        </div>
        <div className="sidebar-actions">
          <button className="reset-btn" onClick={handleResetFilters}>
            Xóa bộ lọc
          </button>
          <button
            className="close-sidebar-btn"
            onClick={toggleSidebar}
            aria-label="Đóng sidebar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div
        className={`sidebar-section ${
          expandedFilters["categories"] ? "expanded" : ""
        }`}
      >
        <div
          className="section-title"
          onClick={() => toggleFilter("categories")}
        >
          Danh mục sản phẩm
          <i
            className={`fa-solid fa-chevron-${
              expandedFilters["categories"] ? "up" : "down"
            } icon`}
          ></i>
        </div>
        <div className="section-content">
          <ul className="category-list">
            {categories.map((category, index) => (
              <li
                key={index}
                className={`category-item ${
                  expandedCategories.includes(category.name) ? "expanded" : ""
                }`}
              >
                <div
                  className="category-link"
                  onClick={() => toggleCategory(category.name)}
                >
                  {category.name}
                  <i
                    className={`fa-solid fa-chevron-${
                      expandedCategories.includes(category.name) ? "up" : "down"
                    }`}
                  ></i>
                </div>
                <ul className="subcategory-list">
                  {category.subcategories.map((subcategory, subIndex) => (
                    <li key={subIndex} className="subcategory-item">
                      <div
                        className="subcategory-link"
                        onClick={() => handleSubcategoryClick(subcategory)}
                      >
                        {subcategory.name}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lọc theo kích thước */}
      <div
        className={`sidebar-section ${
          expandedFilters["size"] ? "expanded" : ""
        }`}
      >
        <div className="section-title" onClick={() => toggleFilter("size")}>
          Kích thước
          <i
            className={`fa-solid fa-chevron-${
              expandedFilters["size"] ? "up" : "down"
            } icon`}
          ></i>
        </div>
        <div className="section-content">
          <div className="sizes-list">
            {sizes.map((size, index) => (
              <div
                key={index}
                className={`size-item ${
                  selectedFilter.sizes.includes(size) ? "selected" : ""
                }`}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lọc theo màu sắc */}
      <div
        className={`sidebar-section ${
          expandedFilters["color"] ? "expanded" : ""
        }`}
      >
        <div className="section-title" onClick={() => toggleFilter("color")}>
          Màu sắc
          <i
            className={`fa-solid fa-chevron-${
              expandedFilters["color"] ? "up" : "down"
            } icon`}
          ></i>
        </div>
        <div className="section-content">
          <div className="colors-list">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`color-item ${
                  selectedFilter.color === color.name ? "selected" : ""
                }`}
                style={{ backgroundColor: color.code }}
                onClick={() => handleColorChange(color.name)}
                title={color.name}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Lọc theo giá */}
      <div
        className={`sidebar-section ${
          expandedFilters["price"] ? "expanded" : ""
        }`}
      >
        <div className="section-title" onClick={() => toggleFilter("price")}>
          Giá
          <i
            className={`fa-solid fa-chevron-${
              expandedFilters["price"] ? "up" : "down"
            } icon`}
          ></i>
        </div>
        <div className="section-content">
          <div className="filter-list">
            {priceRanges.map((range, index) => (
              <div key={index} className="filter-item">
                <input
                  type="checkbox"
                  id={`price-${range.value}`}
                  checked={selectedFilter.price?.value === range.value}
                  onChange={() => handlePriceChange(range)}
                  className="filter-checkbox"
                />
                <label
                  className="filter-label"
                  htmlFor={`price-${range.value}`}
                >
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner khuyến mãi */}
      <div className="sidebar-banner">
        <div className="banner-title">Ưu đãi mùa hè</div>
        <div className="banner-text">Giảm đến 50% cho đơn hàng đầu tiên</div>
        <button
          className="banner-btn"
          onClick={() => navigate("/products?sale=true")}
        >
          Mua ngay
        </button>
      </div>

      {/* Nút ẩn/hiện sidebar ở cuối sidebar - Làm nổi bật hơn */}
      <button
        className="sidebar-toggle-btn-inside"
        onClick={toggleSidebar}
        aria-label="Ẩn sidebar"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
        <span>Ẩn bộ lọc</span>
      </button>
    </div>
  );
};

export default Sidebar;
