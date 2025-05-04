import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye, 
  faEyeSlash,
  faSort,
  faSearch,
  faFilter,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/Layout/AdminLayout';
import '../../styles/css/Admin/BannerManagement.css';

const BannerManagementPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mock data for development (remove in production)
  const mockBanners = [
    {
      _id: '1',
      title: 'Khuyến mãi mùa hè',
      image: 'https://picsum.photos/id/1/800/300',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      position: 'home_top',
      status: 'active',
      clickCount: 345,
      createdAt: '2023-05-15',
    },
    {
      _id: '2',
      title: 'Black Friday',
      image: 'https://picsum.photos/id/2/800/300',
      startDate: '2023-11-20',
      endDate: '2023-11-27',
      position: 'home_middle',
      status: 'scheduled',
      clickCount: 0,
      createdAt: '2023-10-30',
    },
    {
      _id: '3',
      title: 'Tết Nguyên Đán',
      image: 'https://picsum.photos/id/3/800/300',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      position: 'category_page',
      status: 'scheduled',
      clickCount: 0,
      createdAt: '2023-12-20',
    },
    {
      _id: '4',
      title: 'Sinh nhật cửa hàng',
      image: 'https://picsum.photos/id/4/800/300',
      startDate: '2023-04-10',
      endDate: '2023-04-20',
      position: 'home_bottom',
      status: 'inactive',
      clickCount: 523,
      createdAt: '2023-03-25',
    },
    {
      _id: '5',
      title: 'Khuyến mãi chào đông',
      image: 'https://picsum.photos/id/5/800/300',
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      position: 'sidebar',
      status: 'active',
      clickCount: 209,
      createdAt: '2023-09-15',
    },
    {
      _id: '6',
      title: 'Lễ hội xuân',
      image: 'https://picsum.photos/id/6/800/300',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      position: 'home_top',
      status: 'scheduled',
      clickCount: 0,
      createdAt: '2024-01-10',
    },
  ];

  useEffect(() => {
    fetchBanners();
  }, [currentPage, searchTerm, filterStatus, sortConfig]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await axios.get('/api/banners', {
      //   params: {
      //     page: currentPage,
      //     limit: itemsPerPage,
      //     search: searchTerm,
      //     status: filterStatus !== 'all' ? filterStatus : undefined,
      //     sortBy: sortConfig.key,
      //     sortDirection: sortConfig.direction
      //   }
      // });
      // setBanners(response.data.banners);
      // setTotalItems(response.data.totalItems);

      // Mock implementation
      setTimeout(() => {
        let filteredBanners = [...mockBanners];
        
        // Apply search filter
        if (searchTerm) {
          filteredBanners = filteredBanners.filter(banner => 
            banner.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply status filter
        if (filterStatus !== 'all') {
          filteredBanners = filteredBanners.filter(banner => banner.status === filterStatus);
        }
        
        // Apply sorting
        filteredBanners.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
        
        setTotalItems(filteredBanners.length);
        
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);
        
        setBanners(paginatedBanners);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Không thể tải danh sách banner. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    return () => handleSort(key);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="sort-icon" />;
    }
    return sortConfig.direction === 'asc' ? (
      <FontAwesomeIcon icon={faSort} className="sort-icon asc" />
    ) : (
      <FontAwesomeIcon icon={faSort} className="sort-icon desc" />
    );
  };

  const openDeleteModal = (banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedBanner(null);
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;
    
    try {
      // In production, replace with actual API call
      // await axios.delete(`/api/banners/${selectedBanner._id}`);
      
      // Mock implementation
      setBanners(banners.filter(banner => banner._id !== selectedBanner._id));
      setTotalItems(totalItems - 1);
      
      toast.success('Xóa banner thành công!');
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting banner:', err);
      toast.error('Không thể xóa banner. Vui lòng thử lại sau.');
    }
  };

  const handleToggleStatus = async (bannerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // In production, replace with actual API call
      // await axios.patch(`/api/banners/${bannerId}/status`, { status: newStatus });
      
      // Mock implementation
      setBanners(banners.map(banner => 
        banner._id === bannerId ? { ...banner, status: newStatus } : banner
      ));
      
      toast.success(`Banner đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`);
    } catch (err) {
      console.error('Error updating banner status:', err);
      toast.error('Không thể cập nhật trạng thái banner. Vui lòng thử lại sau.');
    }
  };

  const pageCount = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= pageCount; i++) {
    pageNumbers.push(i);
  }

  // Get position display name
  const getPositionDisplay = (position) => {
    const positions = {
      'home_top': 'Đầu trang chủ',
      'home_middle': 'Giữa trang chủ',
      'home_bottom': 'Cuối trang chủ',
      'sidebar': 'Thanh bên',
      'category_page': 'Trang danh mục'
    };
    return positions[position] || position;
  };

  return (
    <AdminLayout>
      <div className="banner-management-page">
        <div className="page-header">
          <h1>Quản lý Banner</h1>
          <Link to="/admin/banners/add" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} /> Thêm Banner
          </Link>
        </div>
        
        <div className="banner-filters">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên banner..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã tắt</option>
              <option value="scheduled">Đã lên lịch</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchBanners} className="btn btn-primary">Thử lại</button>
          </div>
        ) : (
          <>
            <div className="banner-stats">
              <div className="stat-card">
                <h3>Tổng số banner</h3>
                <p>{totalItems}</p>
              </div>
              <div className="stat-card">
                <h3>Đang hoạt động</h3>
                <p>{mockBanners.filter(b => b.status === 'active').length}</p>
              </div>
              <div className="stat-card">
                <h3>Đã lên lịch</h3>
                <p>{mockBanners.filter(b => b.status === 'scheduled').length}</p>
              </div>
              <div className="stat-card">
                <h3>Đã tắt</h3>
                <p>{mockBanners.filter(b => b.status === 'inactive').length}</p>
              </div>
            </div>
            
            <div className="banner-table-container">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th onClick={requestSort('title')}>
                      Tên Banner {getSortIcon('title')}
                    </th>
                    <th>Hình ảnh</th>
                    <th onClick={requestSort('position')}>
                      Vị trí {getSortIcon('position')}
                    </th>
                    <th onClick={requestSort('startDate')}>
                      Ngày bắt đầu {getSortIcon('startDate')}
                    </th>
                    <th onClick={requestSort('endDate')}>
                      Ngày kết thúc {getSortIcon('endDate')}
                    </th>
                    <th onClick={requestSort('status')}>
                      Trạng thái {getSortIcon('status')}
                    </th>
                    <th onClick={requestSort('clickCount')}>
                      Lượt click {getSortIcon('clickCount')}
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length > 0 ? (
                    banners.map(banner => (
                      <tr key={banner._id}>
                        <td>{banner.title}</td>
                        <td>
                          <div className="banner-image">
                            <img src={banner.image} alt={banner.title} />
                          </div>
                        </td>
                        <td>{getPositionDisplay(banner.position)}</td>
                        <td>{new Date(banner.startDate).toLocaleDateString('vi-VN')}</td>
                        <td>{new Date(banner.endDate).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <span className={`status-badge status-${banner.status}`}>
                            {banner.status === 'active' && 'Đang hoạt động'}
                            {banner.status === 'inactive' && 'Đã tắt'}
                            {banner.status === 'scheduled' && 'Đã lên lịch'}
                          </span>
                        </td>
                        <td>{banner.clickCount}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn toggle-btn"
                              onClick={() => handleToggleStatus(banner._id, banner.status)}
                              disabled={banner.status === 'scheduled'}
                              title={banner.status === 'active' ? 'Tắt' : 'Kích hoạt'}
                            >
                              <FontAwesomeIcon icon={banner.status === 'active' ? faEyeSlash : faEye} />
                            </button>
                            <Link 
                              to={`/admin/banners/edit/${banner._id}`}
                              className="action-btn edit-btn"
                              title="Chỉnh sửa"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => openDeleteModal(banner)}
                              title="Xóa"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        Không có banner nào. Hãy thêm banner mới!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {pageCount > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn prev"
                >
                  &laquo; Trước
                </button>
                
                <div className="pagination-numbers">
                  {pageNumbers.map(number => (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      className={`pagination-btn number ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                  className="pagination-btn next"
                >
                  Sau &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa banner "{selectedBanner?.title}"?</p>
            <p className="warning">Hành động này không thể hoàn tác.</p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeDeleteModal}
              >
                Hủy
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteBanner}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BannerManagementPage; 