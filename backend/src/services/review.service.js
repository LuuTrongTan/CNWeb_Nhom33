const httpStatus = require('http-status');
const { Review } = require('../models');
const ApiError = require('../utils/ApiError');
const { productService } = require('./index');

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
  return Review.findById(id);
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
    .exec();
    
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
const updateReview = async (reviewId, updateBody) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
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
const deleteReview = async (reviewId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  
  const productId = review.product;
  
  await review.remove();
  
  // Cập nhật đánh giá trung bình của sản phẩm
  await updateProductAverageRating(productId);
  
  return review;
};

/**
 * Like a review
 * @param {ObjectId} reviewId
 * @param {ObjectId} userId
 * @returns {Promise<Review>}
 */
const likeReview = async (reviewId, userId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  
  // Kiểm tra nếu người dùng đã thích đánh giá này rồi
  if (review.likedBy.includes(userId)) {
    return review;
  }
  
  review.likes += 1;
  review.likedBy.push(userId);
  await review.save();
  
  return review;
};

/**
 * Unlike a review
 * @param {ObjectId} reviewId
 * @param {ObjectId} userId
 * @returns {Promise<Review>}
 */
const unlikeReview = async (reviewId, userId) => {
  const review = await getReviewById(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy đánh giá');
  }
  
  // Kiểm tra nếu người dùng chưa thích đánh giá này
  if (!review.likedBy.includes(userId)) {
    return review;
  }
  
  review.likes -= 1;
  review.likedBy = review.likedBy.filter((id) => id.toString() !== userId.toString());
  await review.save();
  
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

module.exports = {
  createReview,
  getReviewById,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
};
