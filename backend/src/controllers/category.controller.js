const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getAllCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getAllCategory();
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

const getCategory = catchAsync(async (req, res) => {
  const categoryId = req.query.categoryId;
  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');
  }
  const category = await categoryService.getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.send(category);
});

// const updateProduct = catchAsync(async (req, res) => {
//   const productId = req.query.productId;
//   if (!productId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
//   }
//   const product = await productService.updateProductById(productId, req.body);
//   res.send(product);
// });

// const deleteProduct = catchAsync(async (req, res) => {
//   const productId = req.query.productId;
//   if (!productId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
//   }
//   await productService.deleteProductById(productId);
//   res.status(httpStatus.NO_CONTENT).send();
// });

module.exports = {
  createCategory,
  getAllCategory,
  getCategory,
  //   getProducts,
  //   getAllProduct,
  //   getProduct,
  //   updateProduct,
  //   deleteProduct,
};
