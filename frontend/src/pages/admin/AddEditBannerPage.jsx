import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSave, 
  faUpload, 
  faCalendarAlt,
  faTrash,
  faSpinner,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/Layout/AdminLayout';
import '../../styles/css/Admin/AddEditBanner.css';

const AddEditBannerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    linkText: 'Xem ngay',
    position: 'home_top',
    startDate: '',
    endDate: '',
    status: 'active',
    isTargetBlank: true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Mock data for edit mode
  const mockBanners = [
    {
      _id: '1',
      title: 'Khuyến mãi mùa hè',
      description: 'Giảm đến 50% cho tất cả sản phẩm mùa hè',
      image: 'https://picsum.photos/id/1/800/300',
      link: '/sale/summer',
      linkText: 'Mua ngay',
      position: 'home_top',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'active',
      isTargetBlank: false,
      clickCount: 345,
      createdAt: '2023-05-15',
    },
    {
      _id: '2',
      title: 'Black Friday',
      description: 'Săn sale khủng - Giảm đến 70%',
      image: 'https://picsum.photos/id/2/800/300',
      link: '/sale/black-friday',
      linkText: 'Khám phá ngay',
      position: 'home_middle',
      startDate: '2023-11-20',
      endDate: '2023-11-27',
      status: 'scheduled',
      isTargetBlank: true,
      clickCount: 0,
      createdAt: '2023-10-30',
    }
  ];
  
  useEffect(() => {
    if (isEditMode) {
      fetchBannerData();
    } else {
      // Set default dates for new banner
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      setFormData({
        ...formData,
        startDate: formatDate(today),
        endDate: formatDate(nextMonth)
      });
    }
  }, [id]);
  
  const fetchBannerData = async () => {
    setLoading(true);
    try {
      // In production, use actual API call
      // const response = await axios.get(`/api/banners/${id}`);
      // const bannerData = response.data;
      
      // Mock implementation
      setTimeout(() => {
        const bannerData = mockBanners.find(banner => banner._id === id);
        
        if (!bannerData) {
          setError('Banner không tồn tại hoặc đã bị xóa');
          setLoading(false);
          return;
        }
        
        setFormData({
          title: bannerData.title,
          description: bannerData.description || '',
          link: bannerData.link || '',
          linkText: bannerData.linkText || 'Xem ngay',
          position: bannerData.position,
          startDate: bannerData.startDate,
          endDate: bannerData.endDate,
          status: bannerData.status,
          isTargetBlank: bannerData.isTargetBlank
        });
        
        setImagePreview(bannerData.image);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching banner:', err);
      setError('Không thể tải thông tin banner. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ 
        ...prev, 
        image: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)'
      }));
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ 
        ...prev, 
        image: 'Kích thước file quá lớn (tối đa 5MB)'
      }));
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Clear image error
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: null }));
    }
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề banner';
    }
    
    if (!imagePreview && !isEditMode) {
      errors.image = 'Vui lòng chọn ảnh banner';
    }
    
    if (!formData.position) {
      errors.position = 'Vui lòng chọn vị trí hiển thị';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (formData.link && (!formData.linkText || !formData.linkText.trim())) {
      errors.linkText = 'Vui lòng nhập nội dung cho nút liên kết';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin banner');
      return;
    }
    
    setSaving(true);
    try {
      // In production, use actual API calls and FormData to upload image
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   formDataToSend.append(key, value);
      // });
      // if (imageFile) {
      //   formDataToSend.append('image', imageFile);
      // }
      
      // if (isEditMode) {
      //   await axios.put(`/api/banners/${id}`, formDataToSend);
      // } else {
      //   await axios.post('/api/banners', formDataToSend);
      // }
      
      // Mock implementation
      setTimeout(() => {
        setSaving(false);
        toast.success(`Banner đã ${isEditMode ? 'cập nhật' : 'tạo'} thành công!`);
        navigate('/admin/banners');
      }, 1000);
    } catch (err) {
      console.error('Error saving banner:', err);
      toast.error(`Không thể ${isEditMode ? 'cập nhật' : 'tạo'} banner. Vui lòng thử lại sau.`);
      setSaving(false);
    }
  };
  
  const positionOptions = [
    { value: 'home_top', label: 'Đầu trang chủ' },
    { value: 'home_middle', label: 'Giữa trang chủ' },
    { value: 'home_bottom', label: 'Cuối trang chủ' },
    { value: 'sidebar', label: 'Thanh bên' },
    { value: 'category_page', label: 'Trang danh mục' }
  ];
  
  const statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'scheduled', label: 'Lên lịch' }
  ];
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="banner-form-container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Đang tải thông tin banner...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="banner-form-container">
          <div className="error-container">
            <p>{error}</p>
            <Link to="/admin/banners" className="btn btn-primary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="banner-form-container">
        <div className="page-header">
          <h1>{isEditMode ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h1>
          <Link to="/admin/banners" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="banner-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-section">
                <h2>Thông tin cơ bản</h2>
                
                <div className="form-group">
                  <label htmlFor="title">
                    Tiêu đề <span className="required">*</span>
                  </label>
                  <input 
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={formErrors.title ? 'error' : ''}
                    placeholder="Nhập tiêu đề banner"
                  />
                  {formErrors.title && (
                    <div className="error-message">{formErrors.title}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả ngắn cho banner"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h2>Liên kết</h2>
                
                <div className="form-group">
                  <label htmlFor="link">Đường dẫn URL</label>
                  <input 
                    type="text"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="/sale hoặc https://example.com/sale"
                  />
                  <div className="info-message">
                    <FontAwesomeIcon icon={faInfoCircle} /> Để trống nếu banner không cần liên kết
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="linkText">
                      Text liên kết
                    </label>
                    <input 
                      type="text"
                      id="linkText"
                      name="linkText"
                      value={formData.linkText}
                      onChange={handleInputChange}
                      className={formErrors.linkText ? 'error' : ''}
                      placeholder="Xem ngay"
                    />
                    {formErrors.linkText && (
                      <div className="error-message">{formErrors.linkText}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="isTargetBlank"
                        name="isTargetBlank"
                        checked={formData.isTargetBlank}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isTargetBlank">Mở trong tab mới</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-section">
                <h2>Hình ảnh Banner</h2>
                
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="banner-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-box"
                      onClick={handleImageClick}
                    >
                      <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                      <p>Nhấp để tải lên ảnh banner</p>
                      <span className="upload-note">JPG, PNG, GIF hoặc WEBP (tối đa 5MB)</span>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/gif, image/webp"
                    className="image-input"
                  />
                  
                  {formErrors.image && (
                    <div className="error-message">{formErrors.image}</div>
                  )}
                  
                  <div className="image-info">
                    <p>Kích thước khuyến nghị: 1200x400 pixel</p>
                    <p>Tỷ lệ: 3:1 hoặc 4:1 để hiển thị tốt nhất</p>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h2>Thời gian và Vị trí</h2>
                
                <div className="form-group">
                  <label htmlFor="position">
                    Vị trí hiển thị <span className="required">*</span>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={formErrors.position ? 'error' : ''}
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.position && (
                    <div className="error-message">{formErrors.position}</div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">
                      Ngày bắt đầu <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className={formErrors.startDate ? 'error' : ''}
                      />
                      <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                    </div>
                    {formErrors.startDate && (
                      <div className="error-message">{formErrors.startDate}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endDate">
                      Ngày kết thúc <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={formErrors.endDate ? 'error' : ''}
                      />
                      <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                    </div>
                    {formErrors.endDate && (
                      <div className="error-message">{formErrors.endDate}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Trạng thái</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <Link 
              to="/admin/banners" 
              className="btn btn-secondary"
            >
              Hủy
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} /> {isEditMode ? 'Cập nhật' : 'Tạo banner'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddEditBannerPage; 