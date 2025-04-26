import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSearch,
  faTags,
  faCheck,
  faTimes,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/css/Admin/CategoryManagement.css';

const CategoryManagementPage = () => {
  // State variables
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: '',
    isActive: true
  });
  
  // Fetch categories data
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      setFilteredCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setLoading(false);
      toast.error('Không thể tải dữ liệu danh mục');
    }
  };
  
  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, categories]);
  
  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedCategories = [...filteredCategories].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredCategories(sortedCategories);
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
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
      await axios.delete(`/api/categories/${categoryToDelete._id}`);
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
      toast.success('Danh mục đã được xóa thành công');
    } catch (err) {
      toast.error('Không thể xóa danh mục: ' + (err.response?.data?.message || err.message));
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };
  
  // Add/Edit category
  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      imagePreview: '',
      isActive: true
    });
    setEditMode(false);
    setShowAddEditModal(true);
  };
  
  const openEditModal = (category) => {
    setFormData({
      _id: category._id,
      name: category.name,
      description: category.description || '',
      imagePreview: category.image || '',
      isActive: category.isActive !== false
    });
    setEditMode(true);
    setShowAddEditModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('isActive', formData.isActive);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    
    try {
      let response;
      if (editMode) {
        response = await axios.put(`/api/categories/${formData._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update categories list
        setCategories(categories.map(cat => 
          cat._id === formData._id ? response.data : cat
        ));
        toast.success('Danh mục đã được cập nhật thành công');
      } else {
        response = await axios.post('/api/categories', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Add new category to list
        setCategories([...categories, response.data]);
        toast.success('Danh mục đã được tạo thành công');
      }
      
      setShowAddEditModal(false);
    } catch (err) {
      toast.error(
        `Không thể ${editMode ? 'cập nhật' : 'tạo'} danh mục: ${
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
        <h1><FontAwesomeIcon icon={faTags} /> Quản lý danh mục sản phẩm</h1>
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
            {categories.filter(c => c.isActive !== false).length}
          </div>
          <div className="stat-label">Đang kích hoạt</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {categories.filter(c => c.isActive === false).length}
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
                  <th>Hình ảnh</th>
                  <th onClick={() => requestSort('name')}>
                    Tên danh mục
                    {sortConfig.key === 'name' && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </th>
                  <th>Mô tả</th>
                  <th onClick={() => requestSort('isActive')}>
                    Trạng thái
                    {sortConfig.key === 'isActive' && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => requestSort('createdAt')}>
                    Ngày tạo
                    {sortConfig.key === 'createdAt' && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((category) => (
                  <tr key={category._id}>
                    <td className="category-image">
                      {category.image ? (
                        <img src={category.image} alt={category.name} />
                      ) : (
                        <div className="no-image">
                          <FontAwesomeIcon icon={faImage} />
                        </div>
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td className="description-cell">
                      {category.description || 'Không có mô tả'}
                    </td>
                    <td className={`status-cell ${category.isActive !== false ? 'active' : 'inactive'}`}>
                      {category.isActive !== false ? (
                        <><FontAwesomeIcon icon={faCheck} /> Kích hoạt</>
                      ) : (
                        <><FontAwesomeIcon icon={faTimes} /> Vô hiệu</>
                      )}
                    </td>
                    <td>
                      {new Date(category.createdAt).toLocaleDateString('vi-VN')}
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
                  className={currentPage === index + 1 ? 'active' : ''}
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
              : 'Chưa có danh mục nào. Bấm "Thêm danh mục mới" để bắt đầu.'
            }
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h2>Xác nhận xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa danh mục <strong>{categoryToDelete?.name}</strong>?
            </p>
            <p className="warning">Thao tác này không thể hoàn tác.</p>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                className="delete-button"
                onClick={handleDelete}
              >
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
            <h2>{editMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Tên danh mục <span className="required">*</span></label>
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
                <label>Hình ảnh danh mục</label>
                <div className="image-upload-container">
                  <div className="image-preview">
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Category preview" />
                    ) : (
                      <div className="no-image">
                        <FontAwesomeIcon icon={faImage} />
                        <span>Chưa có hình ảnh</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="upload-button-container">
                    <label htmlFor="image" className="upload-button">
                      <FontAwesomeIcon icon={faUpload} /> {editMode ? 'Thay đổi hình ảnh' : 'Tải lên hình ảnh'}
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {formData.imagePreview && (
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => setFormData({
                          ...formData,
                          image: null,
                          imagePreview: ''
                        })}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Xóa hình ảnh
                      </button>
                    )}
                  </div>
                </div>
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
                <button type="submit" className="save-button">
                  {editMode ? 'Cập nhật' : 'Thêm mới'}
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