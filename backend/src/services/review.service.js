const httpStatus = require('http-status');
const { Review } = require('../models');
const ApiError = require('../utils/ApiError');

const createReview = async (reviewBody) => {
  return await Review.create(reviewBody);
};

const queryReview = async (filter, options) => {
  const paginateOptions = {
    page: parseInt(options.page, 10) || 1,
    limit: parseInt(options.limit, 10) || 12,
    sort: options.sortBy || '-createdAt', // Sắp xếp theo ngày tạo mới nhất
  };

  return await Review.paginate(filter, paginateOptions);
};

const getAllReview = async (page = 1, limit = 12) => {
  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;

  const reviews = await Review.find()
    .skip((page - 1) * limit) // Bỏ qua sản phẩm của các trang trước
    .limit(limit); // Giới hạn số lượng sản phẩm mỗi trang

  const total = await Review.countDocuments(); // Tổng số sản phẩm

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: reviews,
  };
};

const getReviewById = async (id) => {
  return await Review.findById(id);
};

const updateReviewById = async (reviewId, updateBody) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  Object.assign(review, updateBody);
  await review.save();
  return review;
};

const deleteReviewById = async (reviewId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  await review.remove();
  return review;
};

const addFeedbackToReview = async (reviewId, feedback) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  // Thêm feedback vào mảng listFeedback
  review.listFeedback.push({
    ...feedback,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Lưu lại comment
  return await review.save();
};

const updateFeedbackInReview = async (reviewId, feedbackId, feedbackBody) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  const feedback = review.listFeedback.find((fb) => fb._id.toString() === feedbackId);
  if (!feedback) {
    throw new Error('Feedback not found');
  }

  Object.assign(feedback, feedbackBody, { updatedAt: Date.now() });

  // Lưu lại comment
  return await review.save();
};

const deleteFeedbackFromReview = async (reviewId, feedbackId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  // Xóa feedback khỏi mảng listFeedback
  review.listFeedback = review.listFeedback.filter((fb) => fb._id.toString() !== feedbackId);

  // Lưu lại comment
  return await review.save();
};

module.exports = {
  createReview,
  queryReview,
  getAllReview,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  addFeedbackToReview,
  updateFeedbackInReview,
  deleteFeedbackFromReview,
};
