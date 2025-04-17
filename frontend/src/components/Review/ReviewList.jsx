import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faThumbsUp, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as farThumbsUp } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import './ReviewList.css';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userAuth, setUserAuth] = useState(null);

  // Lấy thông tin user đã đăng nhập từ localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserAuth(JSON.parse(user));
    }
  }, []);

  // Lấy danh sách đánh giá
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/v1/product/${productId}/reviews`, {
          params: {
            page,
            limit: 5,
            sortBy: 'createdAt:desc',
          },
        });
        
        if (page === 1) {
          setReviews(response.data.results);
        } else {
          setReviews((prevReviews) => [...prevReviews, ...response.data.results]);
        }
        
        setHasMore(response.data.page < response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  // Hàm xử lý thích đánh giá
  const handleLikeReview = async (reviewId) => {
    if (!userAuth) {
      alert('Vui lòng đăng nhập để thích đánh giá');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Kiểm tra xem user đã thích review này chưa
      const review = reviews.find((r) => r._id === reviewId);
      const hasLiked = review.likedBy.includes(userAuth.id);
      
      // Gọi API thích hoặc bỏ thích
      if (hasLiked) {
        await axios.delete(`/v1/review/${reviewId}/unlike`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post(`/v1/review/${reviewId}/like`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      // Cập nhật state
      setReviews(reviews.map((review) => {
        if (review._id === reviewId) {
          const newLikedBy = hasLiked 
            ? review.likedBy.filter((id) => id !== userAuth.id)
            : [...review.likedBy, userAuth.id];
          
          return {
            ...review,
            likes: hasLiked ? review.likes - 1 : review.likes + 1,
            likedBy: newLikedBy
          };
        }
        return review;
      }));
    } catch (err) {
      console.error('Lỗi khi thích đánh giá:', err);
    }
  };

  // Hàm xử lý tải thêm đánh giá
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && page === 1) {
    return <div className="review-loading">Đang tải đánh giá...</div>;
  }

  if (error) {
    return <div className="review-error">{error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</div>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review._id} className="review-item">
          <div className="review-header">
            <div className="review-user-info">
              <div className="review-avatar">
                {review.user.avatar ? (
                  <img src={review.user.avatar} alt={review.user.name} />
                ) : (
                  <div className="default-avatar">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="review-user-name">{review.user.name}</div>
                <div className="review-date">{formatDate(review.createdAt)}</div>
              </div>
            </div>
            {review.verified && (
              <div className="verified-purchase">
                <FontAwesomeIcon icon={faCheck} /> Đã mua hàng
              </div>
            )}
          </div>
          
          <div className="review-rating">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={faStar}
                className={i < review.rating ? "star-filled" : "star-empty"}
              />
            ))}
          </div>
          
          <h4 className="review-title">{review.title}</h4>
          <p className="review-comment">{review.comment}</p>
          
          {review.images && review.images.length > 0 && (
            <div className="review-images">
              {review.images.map((img, index) => (
                <img key={index} src={img} alt={`Review image ${index + 1}`} />
              ))}
            </div>
          )}
          
          <div className="review-actions">
            <button 
              className={`like-button ${userAuth && review.likedBy.includes(userAuth.id) ? 'liked' : ''}`}
              onClick={() => handleLikeReview(review._id)}
            >
              <FontAwesomeIcon 
                icon={userAuth && review.likedBy.includes(userAuth.id) ? faThumbsUp : farThumbsUp} 
              />
              <span>{review.likes}</span>
            </button>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 