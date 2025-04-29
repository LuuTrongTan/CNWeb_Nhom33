import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProductFilter, fetchProductsAPI } from "../../service/productAPI";
import { getAllCategory, getCategoryById } from "../../service/categoryAPI";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSort,
  faImage,
  faTags,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/Admin/ProductManagement.css";

const ProductManagement = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categories2, setCategories2] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [totalProduct, setTotalProduct] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products and categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await fetchProductsAPI();
        console.log("Đã tải sản phẩm:", productsResponse);
        setProducts(productsResponse.data);
        setTotalProduct(productsResponse.total);
        const categoriesResponse = await getAllCategory();
        setCategories(categoriesResponse.categories);
        const formattedCategories = categoriesResponse.categories.reduce(
          (obj, cat) => {
            obj[cat._id] = cat.name;
            return obj;
          },
          {}
        );

        setCategories2(formattedCategories);

        // setFilteredProducts(productsResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        setLoading(false);
        toast.error("Không thể tải dữ liệu sản phẩm");
      }
    };

    fetchData();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [products, searchTerm, categoryFilter, sortConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Handle delete product
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`/api/products/${productToDelete._id}`);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      toast.success("Sản phẩm đã được xóa thành công");
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      console.error("Delete error:", err);
    }
  };

  // Render loading and error states
  if (loading) {
    return (
      <div className="product-management loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-management error">
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faBoxOpen} /> Quản lý Sản phẩm
        </h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} /> Thêm sản phẩm mới
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FontAwesomeIcon icon={faFilter} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Tổng số sản phẩm</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {products.filter((p) => p.stock > 0).length}
          </div>
          <div className="stat-label">Còn hàng</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {products.filter((p) => p.stock === 0).length}
          </div>
          <div className="stat-label">Hết hàng</div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th onClick={() => requestSort("name")}>
                Tên sản phẩm
                <FontAwesomeIcon
                  icon={faSort}
                  className={
                    sortConfig.key === "name"
                      ? `sort-${sortConfig.direction}`
                      : ""
                  }
                />
              </th>
              <th onClick={() => requestSort("brand")}>
                Brand
                <FontAwesomeIcon
                  icon={faSort}
                  className={
                    sortConfig.key === "brand"
                      ? `sort-${sortConfig.direction}`
                      : ""
                  }
                />
              </th>
              <th>Danh mục</th>
              <th onClick={() => requestSort("price")}>
                Giá
                <FontAwesomeIcon
                  icon={faSort}
                  className={
                    sortConfig.key === "price"
                      ? `sort-${sortConfig.direction}`
                      : ""
                  }
                />
              </th>
              <th onClick={() => requestSort("stock")}>
                Tồn kho
                <FontAwesomeIcon
                  icon={faSort}
                  className={
                    sortConfig.key === "stock"
                      ? `sort-${sortConfig.direction}`
                      : ""
                  }
                />
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {totalProduct > 0 ? (
              currentItems.map((product) => (
                <tr key={product._id} className="product-row">
                  <td className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <div className="no-image">
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>
                    <span className="category-badge">
                      <FontAwesomeIcon icon={faTags} />
                      {categories2[product.category]}
                    </span>
                  </td>
                  <td>
                    {product.discountPrice ? (
                      <div className="price-column">
                        <span className="discounted-price">
                          {product.discountPrice.toLocaleString("vi-VN")}₫
                        </span>
                        <span className="original-price">
                          {product.price.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    ) : (
                      <span>{product.price.toLocaleString("vi-VN")}₫</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${
                        product.stock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {product.stock > 0 ? product.stock : "Hết hàng"}
                    </span>
                  </td>
                  <td>
                    <div className="actions-column">
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="btn btn-view"
                      >
                        Xem
                      </Link>
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        onClick={() => {
                          console.log("Navigating to edit product:", product);
                        }}
                        className="btn btn-edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không tìm thấy sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            &laquo; Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau &raquo;
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"?
              <br />
              Hành động này không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
