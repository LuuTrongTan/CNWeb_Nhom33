const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();

router
  .route('/')
  .post(productController.createProduct)
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router.route('/getAllProduct').get(productController.getAllProduct);

router.route('/getFilterProducts').get(productController.getProducts);

module.exports = router;
