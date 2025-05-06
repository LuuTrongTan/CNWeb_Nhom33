import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faTags,
  faCheck,
  faTimes,
  faImage,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/css/Admin/CategoryManagement.css";
import {
  getAllCategory,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
} from "../../service/categoryAPI";

const CategoryManagementPage = () => {
  // State variables
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    tagCategory: "", // Thêm trường tagCategory
  });

  // Fetch categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getAllCategory();
        console.log("Categories data:", response); // Log the fetched data
        setCategories(response.categories);
        setFilteredCategories(response.categories);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        setLoading(false);
        toast.error("Không thể tải dữ liệu danh mục");
      }
    };
    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, categories, filteredCategories]);

  // Sorting logic
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedCategories = [...filteredCategories].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredCategories(sortedCategories);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Delete category
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryById(categoryToDelete._id);
      setCategories(
        categories.filter((cat) => cat._id !== categoryToDelete._id)
      );
      toast.success("Danh mục đã được xóa thành công");
    } catch (err) {
      toast.error(
        "Không thể xóa danh mục: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Add/Edit category
  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
      tagCategory: "", // Hiển thị tagCategory
    });
    setEditMode(false);
    setShowAddEditModal(true);
  };

  const openEditModal = (category) => {
    setFormData({
      _id: category._id,
      name: category.name,
      description: category.description || "",
      isActive: category.isActive !== false,
      tagCategory: category.tagCategory || "", // Hiển thị tagCategory
    });
    setEditMode(true);
    setShowAddEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    if (!formData.tagCategory.trim()) {
      toast.error("Vui lòng nhập tag danh mục");
      return;
    }

    const formDataToSend = {
      name: formData.name ?? "",
      description: formData.description ?? "",
      isActive: formData.isActive ?? true,
      tagCategory: formData.tagCategory ?? "", // Gửi tagCategory
    };
    try {
      let response;
      if (editMode) {
        response = await updateCategoryById(formData._id, formDataToSend);
        // Update categories list
        setCategories(
          categories.map((cat) => (cat._id === formData._id ? response : cat))
        );
        toast.success("Danh mục đã được cập nhật thành công");
      } else {
        response = await createCategory(formDataToSend);
        console.log("New category created:", response); // Log the new category data

        // Add new category to list
        setCategories([response, ...categories]);
        toast.success("Danh mục đã được tạo thành công");
      }
      setShowAddEditModal(false);
    } catch (err) {
      toast.error(
        `Không thể ${editMode ? "cập nhật" : "tạo"} danh mục: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="category-management loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu danh mục...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="category-management error">
        <div className="error-icon">
          <FontAwesomeIcon icon={faTimes} />
        </div>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={fetchCategories}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faTags} /> Quản lý danh mục sản phẩm
        </h1>
        <button className="add-button" onClick={openAddModal}>
          <FontAwesomeIcon icon={faPlus} /> Thêm danh mục mới
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Tổng số danh mục</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {categories.filter((c) => c.isActive !== false).length}
          </div>
          <div className="stat-label">Đang kích hoạt</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {categories.filter((c) => c.isActive === false).length}
          </div>
          <div className="stat-label">Đã vô hiệu</div>
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <>
          <div className="table-container">
            <table className="categories-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("name")}>
                    Tên danh mục
                    {sortConfig.key === "name" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                  <th>Mô tả</th>
                  <th onClick={() => requestSort("isActive")}>
                    Trạng thái
                    {sortConfig.key === "isActive" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                  <th onClick={() => requestSort("createdAt")}>
                    Ngày tạo
                    {sortConfig.key === "createdAt" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td className="description-cell">
                      {category.description || "Không có mô tả"}
                    </td>
                    <td
                      className={`status-cell ${
                        category.isActive !== false ? "active" : "inactive"
                      }`}
                    >
                      {category.isActive !== false ? (
                        <>
                          <FontAwesomeIcon icon={faCheck} /> Kích hoạt
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTimes} /> Vô hiệu
                        </>
                      )}
                    </td>
                    <td>
                      {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="edit-button"
                        onClick={() => openEditModal(category)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => confirmDelete(category)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &laquo; Trước
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">
          <FontAwesomeIcon icon={faTags} size="3x" />
          <h2>Không tìm thấy danh mục nào</h2>
          <p>
            {searchTerm
              ? `Không tìm thấy kết quả phù hợp với "${searchTerm}"`
              : 'Chưa có danh mục nào. Bấm "Thêm danh mục mới" để bắt đầu.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h2>Xác nhận xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa danh mục{" "}
              <strong>{categoryToDelete?.name}</strong>?
            </p>
            <p className="warning">Thao tác này không thể hoàn tác.</p>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal category-form-modal">
            <h2>{editMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Tên danh mục <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả về danh mục này"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tagCategory">
                  Tag danh mục <span className="required">*</span>
                </label>
                <select
                  id="tagCategory"
                  name="tagCategory"
                  value={formData.tagCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn tag danh mục --</option>
                  <option value="Áo">Áo</option>
                  <option value="Quần">Quần</option>
                  <option value="Giày & Dép">Giày & Dép</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="isActive">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Kích hoạt danh mục
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddEditModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="save-button"
                  // onClick={() => setShowAddEditModal(false)}
                >
                  {editMode ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
