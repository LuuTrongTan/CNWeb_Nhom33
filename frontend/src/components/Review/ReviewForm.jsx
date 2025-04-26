import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userAuth, setUserAuth] = useState(null);

  // Kiểm tra user đã đăng nhập chưa
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserAuth(JSON.parse(user));
    }
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Giới hạn số lượng file
    if (files.length + imageFiles.length > 5) {
      setError('Bạn chỉ có thể tải lên tối đa 5 ảnh');
      return;
    }
    
    // Kiểm tra kích thước và định dạng file
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 2 * 1024 * 1024; // 2MB
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type);
      
      if (!isValidSize) {
        setError('Kích thước ảnh không được vượt quá 2MB');
      }
      
      if (!isValidType) {
        setError('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WEBP');
      }
      
      return isValidSize && isValidType;
    });
    
    if (validFiles.length === 0) return;
    
    // Tạo URL hiển thị ảnh preview
    const newImagePreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prevImages => [...prevImages, ...newImagePreviews]);
    setImageFiles(prevFiles => [...prevFiles, ...validFiles]);
    
    // Reset error nếu thành công
    setError('');
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    
    // Xóa URL để tránh memory leak
    URL.revokeObjectURL(images[index]);
    
    newImages.splice(index, 1);
    newImageFiles.splice(index, 1);
    
    setImages(newImages);
    setImageFiles(newImageFiles);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    const uploadPromises = imageFiles.map(async (file) => {
      // Tạo form data để upload file
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        return response.data.url;
      } catch (err) {
        console.error('Lỗi khi tải ảnh lên:', err);
        throw new Error('Không thể tải ảnh lên');
      }
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!userAuth) {
      setError('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Upload ảnh nếu có
      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }
      
      // Gửi đánh giá
      const token = localStorage.getItem('accessToken');
      const reviewData = {
        product: productId,
        rating,
        title: title.trim() || `Đánh giá ${rating} sao`,
        comment,
        images: imageUrls
      };
      
      await axios.post(`/product/${productId}/reviews`, reviewData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset form
      setRating(0);
      setHover(0);
      setTitle('');
      setComment('');
      setImages([]);
      setImageFiles([]);
      
      // Hiển thị thông báo thành công
      setSuccess('Cảm ơn bạn đã gửi đánh giá!');
      
      // Gọi callback để refresh danh sách đánh giá
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userAuth) {
    return (
      <div className="review-form-login-required">
        <h4>Viết đánh giá của bạn</h4>
        <p>Vui lòng <a href="/login">đăng nhập</a> để gửi đánh giá</p>
      </div>
    );
  }

  return (
    <div className="review-form">
      <h4>Viết đánh giá của bạn</h4>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Đánh giá của bạn</label>
          <div className="rating-select">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onClick={() => setRating(ratingValue)}
                    className="hidden-radio"
                  />
                  <FontAwesomeIcon
                    icon={ratingValue <= (hover || rating) ? faStar : farStar}
                    className="star-selectable"
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Tiêu đề (không bắt buộc)</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề ngắn gọn cho đánh giá của bạn"
            maxLength="100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">Nội dung đánh giá</label>
          <textarea
            id="comment"
            rows="5"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này"
            maxLength="1000"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Thêm hình ảnh (không bắt buộc)</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="review-images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="image-upload-input"
            />
            <label htmlFor="review-images" className="image-upload-button">
              Chọn ảnh
            </label>
            <small>Tối đa 5 ảnh, mỗi ảnh không quá 2MB</small>
          </div>
          
          {images.length > 0 && (
            <div className="image-previews">
              {images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={image} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    className="remove-image" 
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 