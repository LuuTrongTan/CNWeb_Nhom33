const express = require('express');
const categoryController = require('../controllers/category.controller');
const router = express.Router();

router
  .route('/')
  .post(categoryController.createCategory)
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

router.route('/getAllCategory').get(categoryController.getAllCategory);
router.route('/getCategoriesByTagCategory').get(categoryController.getCategoriesByTagCategory);

module.exports = router;
