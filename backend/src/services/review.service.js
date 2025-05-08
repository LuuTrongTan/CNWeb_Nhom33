const httpStatus = require('http-status');
const { Review, Picture, User } = require('../models');
const ApiError = require('../utils/ApiError');
const productService = require('./product.service');
const pictureService = require('./picture.service');

/**
 * Create a review
 * @param {Object} reviewBody
 * @returns {Promise<Review>}
 */
const createReview = async (reviewBody) => {
  // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
  const existingReview = await Review.findOne({
    user: reviewBody.user,
    product: reviewBody.product,
  });

  if (existingReview) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bạn đã đánh giá sản phẩm này rồi');
  }

  const review = await Review.create(reviewBody);

  // Cập nhật đánh giá trung bình của sản phẩm
  await updateProductAverageRating(reviewBody.product);

  return review;
};

/**
 * Get review by id
 * @param {ObjectId} id
 * @returns {Promise<Review>}
 */
const getReviewById = async (id) => {
  const review = await Review.findById(id).populate('user', 'name avatar').lean().exec();

  for (const feedback of review.listFeedback) {
    if (feedback.user) {
      const user = await User.findById(feedback.user).select('name avatar').lean();
      feedback.user = user;
    }
  }

  return review;
};

/**
 * Get reviews for a product
 * @param {ObjectId} productId
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getProductReviews = async (productId, options) => {
  const { page, limit, sort } = options;

  const reviews = await Review.find({ product: productId })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name avatar')
    .lean()
    .exec();

  for (const review of reviews) {
    for (const feedback of review.listFeedback) {
      if (feedback.user) {
        const user = await User.findById(feedback.user).select('name avatar').lean();
        feedback.user = user;
      }
    }
  }

  const total = await Review.countDocuments({ product: productId });

  return {
    results: reviews,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Get reviews by a user
 * @param {ObjectId} userId
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getUserReviews = async (userId, options) => {
  const { page, limit, sort } = options;

  const reviews = await Review.find({ user: userId })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('product', 'name images price')
    .exec();

  const total = await Review.countDocuments({ user: userId });

  return {
    results: reviews,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

/**
 * Update review by id
 * @param {ObjectId} reviewId
 * @param {Object} updateBody
 * @returns {Promise<Review>}
 */
const updateReview = async (reviewId, updateBody, userId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền chỉnh sửa đánh giá này');
  }

  Object.assign(review, updateBody);
  await review.save();

  // Cập nhật đánh giá trung bình của sản phẩm
  await updateProductAverageRating(review.product);

  return review;
};

/**
 * Delete review by id
 * @param {ObjectId} reviewId
 * @returns {Promise<Review>}
 */
const deleteReview = async (reviewId, userId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Bạn không có quyền xóa đánh giá này');
  }
  const productId = review.product;

  await Review.findByIdAndDelete(reviewId);

  // Xử lý xóa ảnh nếu có
  if (review.images && review.images.length > 0) {
    for (const imageUrl of review.images) {
      const picture = await Picture.findOne({ link: imageUrl });
      if (picture) {
        try {
          await pictureService.deletePictureById(picture.id);
          console.log('Xóa thành công');
        } catch (err) {
          console.error(`Lỗi khi xóa ảnh từ Cloudinary (${imageUrl}):`, err.message);
        }
      } else {
        console.warn(`Không tìm thấy ảnh với URL: ${imageUrl}`);
      }
    }
  }

  // Cập nhật đánh giá trung bình của sản phẩm
  await updateProductAverageRating(productId);

  return review;
};

/**
 * Update product average rating
 * @param {ObjectId} productId
 * @returns {Promise<void>}
 */
const updateProductAverageRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await productService.updateProductById(productId, { rating: 0, numReviews: 0 });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await productService.updateProductById(productId, {
    rating: averageRating,
    numReviews: reviews.length,
  });
};

const addFeedbackToReview = async (reviewId, feedback) => {
  let review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  review.listFeedback.push({
    ...feedback,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Lưu lại review
  await review.save();

  review = await getReviewById(reviewId);

  return review;
};

const updateFeedbackInReview = async (reviewId, feedbackId, feedbackBody) => {
  let review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  const feedback = review.listFeedback.find((fb) => fb._id.toString() === feedbackId);
  if (!feedback) {
    throw new Error('Feedback not found');
  }

  Object.assign(feedback, feedbackBody, { updatedAt: Date.now() });

  // Lưu lại comment
  await review.save();

  review = await getReviewById(reviewId);

  return review;
};

const deleteFeedbackFromReview = async (reviewId, feedbackId) => {
  let review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }

  // Xóa feedback khỏi mảng listFeedback
  review.listFeedback = review.listFeedback.filter((fb) => fb._id.toString() !== feedbackId);

  // Lưu lại comment
  await review.save();

  review = await getReviewById(reviewId);

  return review;
};

module.exports = {
  createReview,
  getReviewById,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  addFeedbackToReview,
  updateFeedbackInReview,
  deleteFeedbackFromReview,
};
