const express = require('express');
const categoryController = require('../../controllers/category.controller');
const router = express.Router();

router.route('/').post(categoryController.createCategory).get(categoryController.getCategory);
//   .patch(productController.updateProduct)
//   .delete(productController.deleteProduct);

router.route('/getAllCategory').get(categoryController.getAllCategory);

module.exports = router;
