import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProductById } from "../../service/productAPI";
import {
  faStar,
  faThumbsUp,
  faCheck,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp as farThumbsUp } from "@fortawesome/free-regular-svg-icons";
import axios from "axios";
import "./ReviewList.css";
import {
  getReviewByProduct,
  deleteReviewById,
  updateReviewById,
  createFeedBack,
  deleteFeedbackById,
  updateFeedbackById,
} from "../../service/ReviewAPI";

import ReviewForm from "./ReviewForm";

const ReviewList = ({ productId, updateProduct }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userAuth, setUserAuth] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [feedBackToDelete, setFeedBackToDelete] = useState(null);
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [feedbackToEdit, setFeedbackToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditFeedbackOpen, setIsEditFeedbackOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Lấy thông tin user đã đăng nhập từ localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    console.log(user);
    if (user) {
      setUserAuth(JSON.parse(user));
    }
  }, []);

  // Lấy danh sách đánh giá
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await getReviewByProduct(productId, page);
        console.log("Đánh giá:", response);

        if (page === 1) {
          setReviews(response.results);
        } else {
          setReviews((prevReviews) => [...prevReviews, ...response.results]);
        }

        setHasMore(response.page < response.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  //Hàm xử lý feedBackReview
  const handleReplySubmit = async (reviewId) => {
    if (!replyContent.trim()) {
      alert("Nội dung trả lời không được để trống.");
      return;
    }

    try {
      console.log("replyContent", replyContent);
      const response = await createFeedBack(
        reviewId,
        userAuth.id,
        replyContent
      );
      console.log("response", response);

      // Cập nhật danh sách review với trả lời mới
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId ? response : review
        )
      );

      // Đặt lại trạng thái
      setReplyingTo(null);
      setReplyContent("");
    } catch (err) {
      console.error("Lỗi khi gửi trả lời:", err);
    }
  };

  const handleEditFeedback = (feedback, review) => {
    setReviewToEdit(review);
    setFeedbackToEdit(feedback);
    setIsEditFeedbackOpen(true);
  };

  const handleUpdateFeedback = async () => {
    if (!feedbackToEdit.content.trim()) {
      alert("Nội dung không được để trống.");
      return;
    }

    try {
      const response = await updateFeedbackById(
        feedbackToEdit._id,
        reviewToEdit._id,
        {
          content: feedbackToEdit.content,
        }
      );

      // Cập nhật state
      setReviews(
        reviews.map((review) =>
          review._id === reviewToEdit._id ? response : review
        )
      );

      setIsEditFeedbackOpen(false);
      setReviewToEdit(null);
      setFeedbackToEdit(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err);
    }
  };

  const confirmDeleteFeedback = (feedBack, review) => {
    setFeedBackToDelete(feedBack);
    setReviewToDelete(review);
  };

  const handleConfirmDeleteFeedback = async (feedBack, review2) => {
    try {
      const response = await deleteFeedbackById(feedBack._id, review2._id);
      // Cập nhật danh sách review với trả lời mới
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === review2._id ? response : review
        )
      );
      setFeedBackToDelete(null);
      setReviewToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa bình luận:", err);
    }
  };
  // Hàm xử lý  đánh giá
  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setIsEditModalOpen(true);
  };

  const handleUpdateReview = async () => {
    if (!reviewToEdit.title.trim() || !reviewToEdit.comment.trim()) {
      alert("Tiêu đề và nội dung không được để trống.");
      return;
    }

    try {
      await updateReviewById(reviewToEdit._id, {
        title: reviewToEdit.title,
        comment: reviewToEdit.comment,
      });

      // Cập nhật state
      setReviews(
        reviews.map((review) =>
          review._id === reviewToEdit._id
            ? {
                ...review,
                title: reviewToEdit.title,
                comment: reviewToEdit.comment,
              }
            : review
        )
      );

      setIsEditModalOpen(false);
      setReviewToEdit(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err);
    }
  };

  const confirmDeleteReview = async (review) => {
    setReviewToDelete(review);
  };

  const handleConfirmDelete = async (review2) => {
    try {
      await deleteReviewById(review2._id, userAuth.id);

      // Cập nhật state
      setReviews(reviews.filter((review) => review._id !== reviewToDelete._id));
      setReviewToDelete(null);
      const data = await getProductById(productId);
      updateProduct(data);
    } catch (err) {
      console.error("Lỗi khi xóa đánh giá:", err);
    }
  };

  // Hàm xử lý tải thêm đánh giá
  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toggleDropdown = (reviewId) => {
    setDropdownOpen((prev) => (prev === reviewId ? null : reviewId));
  };

  if (loading && page === 1) {
    return <div className="review-loading">Đang tải đánh giá...</div>;
  }

  if (error) {
    return <div className="review-error">{error}</div>;
  }

  const handleNewReview = async (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    const data = await getProductById(productId);
    updateProduct(data);
  };

  if (reviews.length === 0) {
    return (
      <>
        <div className="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</div>
        <ReviewForm productId={productId} onReviewSubmitted={handleNewReview} />
      </>
    );
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
                <div className="review-date">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>
            <div className="review-actions">
              {userAuth && userAuth.id === review.user._id && (
                <div className="dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => toggleDropdown(review._id)}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  {dropdownOpen === review._id && (
                    <div className="dropdown-menu">
                      <button
                        className="edit-button"
                        onClick={() => handleEditReview(review)}
                      >
                        Sửa
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => confirmDeleteReview(review)}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
              {review.verified && (
                <div className="verified-purchase">
                  <FontAwesomeIcon icon={faCheck} /> Đã mua hàng
                </div>
              )}
            </div>
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
          <p className="review-comment">{review.comment} </p>

          {review.images && review.images.length > 0 && (
            <div className="review-images">
              {review.images.map((img, index) => (
                <img key={index} src={img} alt={`Review image ${index + 1}`} />
              ))}
            </div>
          )}
          <div className="review-actions">
            <button
              className="reply-button"
              onClick={() => setReplyingTo(review._id)}
            >
              Trả lời
            </button>
          </div>

          {review.listFeedback.length > 0 &&
            review.listFeedback.map((feedBack) => (
              <div key={feedBack._id} className="feedBack-item">
                <div className="review-header">
                  <div className="review-user-info">
                    <div className="review-avatar">
                      {feedBack.user.avatar ? (
                        <img
                          src={feedBack.user.avatar}
                          alt={feedBack.user.name}
                        />
                      ) : (
                        <div className="default-avatar">
                          {feedBack.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="review-user-name">
                        {feedBack.user.name}
                      </div>
                      <div className="review-date">
                        {formatDate(feedBack.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="review-actions">
                    {userAuth && userAuth.id === feedBack.user._id && (
                      <div className="dropdown">
                        <button
                          className="dropdown-toggle"
                          onClick={() => toggleDropdown(feedBack._id)}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {dropdownOpen === feedBack._id && (
                          <div className="dropdown-menu">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEditFeedback(feedBack, review)
                              }
                            >
                              Sửa
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => {
                                confirmDeleteFeedback(feedBack, review);
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="review-feedBack">{feedBack.content}</p>
              </div>
            ))}

          {replyingTo === review._id && (
            <div className="reply-form">
              <textarea
                placeholder="Nhập nội dung trả lời..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              ></textarea>
              <div className="reply-actions">
                <button
                  className="cancel-reply-button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Hủy
                </button>
                <button
                  className="submit-reply-button"
                  onClick={() => handleReplySubmit(review._id)}
                >
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {reviewToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa đánh giá này?</p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setReviewToDelete(null)}
              >
                Hủy
              </button>
              <button
                className="delete-button"
                onClick={() => handleConfirmDelete(reviewToDelete)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {feedBackToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setFeedBackToDelete(null);
                  setReviewToDelete(null);
                }}
              >
                Hủy
              </button>
              <button
                className="delete-button"
                onClick={() =>
                  handleConfirmDeleteFeedback(feedBackToDelete, reviewToDelete)
                }
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sửa đánh giá</h2>
            <div className="form-group">
              <label htmlFor="edit-title">Tiêu đề</label>
              <input
                id="edit-title"
                type="text"
                value={reviewToEdit.title}
                onChange={(e) =>
                  setReviewToEdit({ ...reviewToEdit, title: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-comment">Nội dung</label>
              <textarea
                id="edit-comment"
                rows="4"
                value={reviewToEdit.comment}
                onChange={(e) =>
                  setReviewToEdit({ ...reviewToEdit, comment: e.target.value })
                }
              ></textarea>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setReviewToEdit(null);
                }}
              >
                Hủy
              </button>
              <button className="save-button" onClick={handleUpdateReview}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditFeedbackOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Sửa bình luận</h2>
            <div className="form-group">
              <label htmlFor="edit-comment">Nội dung</label>
              <textarea
                id="edit-comment"
                rows="4"
                value={feedbackToEdit.content}
                onChange={(e) => {
                  setFeedbackToEdit({
                    ...feedbackToEdit,
                    content: e.target.value,
                  });

                  setReviewToEdit({ ...reviewToEdit });
                }}
              ></textarea>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setIsEditFeedbackOpen(false);
                  setFeedbackToEdit(null);
                  setReviewToEdit(null);
                }}
              >
                Hủy
              </button>
              <button className="save-button" onClick={handleUpdateFeedback}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {hasMore && (
        <div className="load-more-container">
          <button
            className="load-more-button"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Xem thêm đánh giá"}
          </button>
        </div>
      )}

      <ReviewForm productId={productId} onReviewSubmitted={handleNewReview} />
    </div>
  );
};

export default ReviewList;
