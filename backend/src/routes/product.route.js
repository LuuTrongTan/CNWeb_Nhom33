const express = require('express');
const productController = require('../controllers/product.controller');
const reviewController = require('../controllers/review.controller');
const auth = require('../middlewares/auth');
const router = express.Router();

router
  .route('/')
  .post(productController.createProduct)
  .get(productController.getProductById)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router.route('/getAllProduct').get(productController.getAllProduct);

router.route('/searchProducts').post(productController.getProductsBySearch);

router.route('/getByCategory').get(productController.getProductsByCategory);

router.route('/getRelated').get(productController.getRelatedProducts);

// Thêm route để lấy đánh giá theo sản phẩm
router.route('/:productId/reviews').get(reviewController.getProductReviews).post(auth(), reviewController.createReview);

module.exports = router;
