const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { reviewService } = require('../services');

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.body);
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

const getAllReview = catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query; // Lấy giá trị từ request query

  const reviews = await reviewService.getAllReview(parseInt(page), parseInt(limit));
  if (!reviews) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reviews not found');
  }
  res.send(reviews);
});

const getReview = catchAsync(async (req, res) => {
  const reviewId = req.query.reviewId;
  if (!reviewId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review ID is required');
  }
  const review = await reviewService.getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }
  res.send(review);
});

const updateReview = catchAsync(async (req, res) => {
  const reviewId = req.query.reviewId;
  if (!reviewId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review ID is required');
  }
  const review = await reviewService.updateReviewById(reviewId, req.body);
  res.send(review);
});

const deleteReview = catchAsync(async (req, res) => {
  const reviewId = req.query.reviewId;
  if (!reviewId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Review ID is required');
  }
  await reviewService.deleteReviewById(reviewId);
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
  getAllReview,
  getReview,
  updateReview,
  deleteReview,
  addFeedbackToReview,
  updateFeedbackInReview,
  deleteFeedbackFromReview,
};
