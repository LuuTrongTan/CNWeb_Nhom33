const express = require('express');
const reviewController = require('../controllers/review.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .post(auth(), reviewController.createReview)
  .get(reviewController.getReview)
  .patch(auth(), reviewController.updateReview)
  .delete(auth(), reviewController.deleteReview);

// router.route('/getAllReview').get(reviewController.getAllReview);

router.route('/getFilterReview').get(reviewController.getReviews);

// Thêm route lấy đánh giá theo sản phẩm
router.route('/product/:productId').get(reviewController.getProductReviews);

// Thêm route lấy đánh giá của người dùng
router.route('/user/:userId').get(auth(), reviewController.getUserReviews);

// router.route('/:reviewId/feedback').post(reviewController.addFeedbackToReview);

// router
//   .route('/:reviewId/feedback/:feedbackId')
//   .patch(reviewController.updateFeedbackInReview)
//   .delete(reviewController.deleteFeedbackFromReview);

module.exports = router;
