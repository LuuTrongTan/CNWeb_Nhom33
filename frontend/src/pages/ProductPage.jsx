import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faHome,
  faChevronRight,
  faSort,
  faSearch,
  faTh,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "../components/Product/ProductCard";
import "../styles/css/ProductList.css";
import { getProductFilter } from "../service/productAPI"; // Import hàm fetchProducts từ productAPI

import { FilterContext } from "../context/FilterContext"; // Import context filter nếu cần

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] = useState("");
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalProduct, setTotalProduct] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);
  const { selectedFilter, setSelectedFilter, resetFilters } =
    useContext(FilterContext);

  const sortOptions = [
    { id: "featured", name: "Nổi bật" },
    { id: "newest", name: "Mới nhất" },
    { id: "price-asc", name: "Giá tăng dần" },
    { id: "price-desc", name: "Giá giảm dần" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const categoryId =
          selectedFilter.category && selectedFilter.category._id
            ? selectedFilter.category._id
            : null;

        const response = await getProductFilter(
          selectedFilter.color,
          categoryId,
          selectedFilter.sizes,
          selectedFilter.price.min,
          selectedFilter.price.max,
          1,
          searchTerm
        );

        console.log("Dữ liệu sản phẩm:", response);
        setProducts(response.products);
        setTotalProduct(response.total);
        setTotalPage(response.totalPages);

        if (totalPage && totalPage > 0) {
          const initialPages = [];
          for (let i = 1; i <= totalPage; i++) {
            initialPages.push({ index: i, wasClicked: i === 1 });
          }
          setPageNumbers(initialPages);
        }

        setTimeout(() => {
          setLoading(false);
        }, 500); // Giả lập thời gian tải
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu sản phẩm");
        setLoading(false);
        console.error("Lỗi khi tải sản phẩm:", err);
      }
    };
    setCurrentPage(1);

    fetchProducts();
  }, [totalPage, selectedFilter, searchTerm]);

  // Sắp xếp sản phẩm
  const sortProducts = (a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "newest") return new Date(b.id) - new Date(a.id); // Giả sử id có thể dùng làm mốc thời gian

    // Mặc định: nổi bật
    return a.id - b.id;
  };

  // //Lấy thêm sản phẩm
  const handleClickMoreProduct = async (pageNumber) => {
    try {
      // if (pageNumber.wasClicked) return;

      const response = await getProductFilter(
        selectedFilter.color,
        selectedFilter.category._id,
        selectedFilter.sizes,
        selectedFilter.price.min,
        selectedFilter.price.max,
        pageNumber.index,
        searchTerm
      );

      console.log("Dữ liệu sản phẩm:", response);

      setProducts(response.products);

      setCurrentPage(pageNumber.index);

      // setPageNumbers((prevPageNumbers) =>
      //   prevPageNumbers.map((page) =>
      //     page.index === pageNumber.index ? { ...page, wasClicked: true } : page
      //   )
      // );
    } catch (error) {
      console.error("Lỗi khi lấy thêm sản phẩm:", error);
    }
  };

  // Click bên ngoài dropdown để đóng nó
  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest(".filter-dropdown")) {
        setShowSortFilter(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  const handleDeleteFilter = (filterType, Filter) => {
    if (filterType === "category") {
      setSelectedFilter((prev) => ({
        ...prev,
        category: null,
      }));
    } else if (filterType === "size") {
      setSelectedFilter((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((size) => size !== Filter),
      }));
    } else {
      setSelectedFilter((prev) => ({
        ...prev,
        color: "",
      }));
    }
  };

  // Render lỗi nếu có
  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="breadcrumb">
          <div className="breadcrumb-item">
            <Link to="/">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
          <span className="breadcrumb-separator">
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
          <div className="breadcrumb-item active">Sản phẩm</div>
        </div>

        <h1 className="products-title">Sản phẩm</h1>
        <p className="products-description">
          Khám phá bộ sưu tập sản phẩm mới nhất với chất lượng và giá cả hợp lý
        </p>
      </div>

      <div className="search-filters-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // setCurrentPage(1);
            }}
          />
          <button className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="view-options">
          <button
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <FontAwesomeIcon icon={faTh} />
          </button>
          <button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filters-wrapper">
          <div className="filters-sizes-category-color">
            {selectedFilter.category && selectedFilter.category._id && (
              <div className="select-filter">
                <div
                  className="option"
                  onClick={() =>
                    handleDeleteFilter("category", selectedFilter.category)
                  }
                >
                  {selectedFilter.category.name}
                </div>
              </div>
            )}
            {selectedFilter.sizes.length > 0 && (
              <div className="select-filter">
                {selectedFilter.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="option"
                    onClick={() => handleDeleteFilter("size", size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            )}

            {selectedFilter.color.length > 0 && (
              <div className="select-filter">
                <div
                  className="option"
                  onClick={() =>
                    handleDeleteFilter("color", selectedFilter.color)
                  }
                >
                  {selectedFilter.color}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sort-options">
          <span className="sort-label">Sắp xếp theo:</span>
          <div className="filter-dropdown">
            <button
              className="filter-button"
              onClick={() => handleFilterClick("sort")}
            >
              <FontAwesomeIcon icon={faSort} />
              <span>
                {sortOptions.find((option) => option.id === sortBy)?.name ||
                  "Nổi bật"}
              </span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="dropdown-icon"
              />
            </button>

            {showSortFilter && (
              <div className="filter-menu">
                {sortOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`filter-menu-item ${
                      sortBy === option.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortFilter(false);
                    }}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={faSearch} />
          </div>
          <h2 className="empty-state-title">Không tìm thấy sản phẩm</h2>
          <p className="empty-state-message">
            Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn. Vui
            lòng thử lại với các bộ lọc khác.
          </p>
          <button
            className="empty-state-button"
            onClick={() => {
              resetFilters();
              setSearchTerm("");
              setCurrentPage(1);
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>{" "}
            </div>
          ) : (
            <div>
              <div className={`products-${viewMode}`}>
                {products.map((product) => {
                  console.log("product: ", product);
                  
                  return(
                  <ProductCard
                    key={product.id}
                    product={{
                      _id: product.id,
                      name: product.name,
                      price: product.price,
                      images: product.images ? [product.images[0]] : [],
                      category: product.tagCategory,
                      isNew: product.id % 3 === 0,
                      discount: product.id % 2 === 0 ? 20 : 0,
                    }}
                  />
                )})}
              </div>
              {/* Phân trang */}
              {totalPage > 1 && (
                <div className="pagination">
                  <ul className="pagination-list">
                    {pageNumbers.map((number) => (
                      <li key={number.index} className="pagination-item">
                        <button
                          className={`pagination-button ${
                            currentPage === number.index ? "active" : ""
                          }`}
                          onClick={() => {
                            setCurrentPage(number.index);
                            handleClickMoreProduct(number);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          {number.index}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
