const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { reviewService, productService } = require('../services');

/**
 * Tạo đánh giá sản phẩm mới
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về đánh giá đã tạo
 */
const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview({
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(review);
});

// $in thì  bất kỳ sản phẩm nào có ít nhất một giá trị trong danh sách. còn $all thì  sản phẩm phải chứa tất cả các giá trị được chỉ định.
const getReviews = catchAsync(async (req, res) => {
  const filter = {
    ...(req.query.rating && { rating: { $in: req.query.rating } }),
  };

  const options = {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
  };

  const result = await reviewService.queryReview(filter, options);
  res.send(result);
});

/**
 * Lấy đánh giá theo ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về đánh giá
 */
const getReview = catchAsync(async (req, res) => {
  const reviewId = req.query.reviewId; // Lấy reviewId từ query parameter
  const review = await reviewService.getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  res.send(review);
});

/**
 * Lấy tất cả đánh giá của một sản phẩm
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về danh sách đánh giá phân trang
 */
const getProductReviews = catchAsync(async (req, res) => {
  const filter = req.params.productId;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await reviewService.getProductReviews(filter, options);
  res.send(result);
});

/**
 * Lấy tất cả đánh giá của một người dùng
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về danh sách đánh giá phân trang
 */
const getUserReviews = catchAsync(async (req, res) => {
  const filter = { user: req.params.userId };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await reviewService.getUserReviews(filter, options);
  res.send(result);
});

/**
 * Cập nhật đánh giá
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về đánh giá đã cập nhật
 */
const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReview(req.query.reviewId, req.body, req.user.id);
  console.log('updateBody:', req.body);
  res.send(review);
});

/**
 * Xóa đánh giá
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Trả về null
 */
const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.query.reviewId, req.query.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const addFeedbackToReview = catchAsync(async (req, res) => {
  const review = await reviewService.addFeedbackToReview(req.params.reviewId, req.body);
  res.status(httpStatus.OK).send(review);
});

const updateFeedbackInReview = catchAsync(async (req, res) => {
  const { reviewId, feedbackId } = req.params;
  const feedbackBody = req.body;

  const updatedReview = await reviewService.updateFeedbackInReview(reviewId, feedbackId, feedbackBody);
  res.status(httpStatus.OK).send(updatedReview);
});

const deleteFeedbackFromReview = catchAsync(async (req, res) => {
  const review = await reviewService.deleteFeedbackFromReview(req.params.reviewId, req.params.feedbackId);
  res.status(httpStatus.OK).send(review);
});

module.exports = {
  createReview,
  getReviews,
  // getAllReview,
  getReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addFeedbackToReview,
  updateFeedbackInReview,
  deleteFeedbackFromReview,
};
