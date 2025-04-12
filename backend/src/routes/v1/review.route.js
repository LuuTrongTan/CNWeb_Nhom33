const express = require('express');
const reviewController = require('../../controllers/review.controller');
const router = express.Router();

router
  .route('/')
  .post(reviewController.createReview)
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

router.route('/getAllReview').get(reviewController.getAllReview);

router.route('/getFilterReview').get(reviewController.getReviews);

router.route('/:reviewId/feedback').post(reviewController.addFeedbackToReview);

router
  .route('/:reviewId/feedback/:feedbackId')
  .patch(reviewController.updateFeedbackInReview)
  .delete(reviewController.deleteFeedbackFromReview);

module.exports = router;
