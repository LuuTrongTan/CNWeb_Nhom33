const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
});

const getProductsBySearch = catchAsync(async (req, res) => {
  const result = await productService.searchProducts(req.body);
  res.send(result);
});

const getAllProduct = catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query; // Lấy giá trị từ request query

  const products = await productService.getAllProducts(parseInt(page), parseInt(limit));
  if (!products) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(products);
});

const getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId, page = 1, limit = 12 } = req.query;

  if (!categoryId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category ID is required');
  }

  const products = await productService.getProductsByCategory(categoryId, page, limit);
  res.send(products);
});

const getRelatedProducts = catchAsync(async (req, res) => {
  const { productId, limit = 8 } = req.query;

  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }

  const products = await productService.getRelatedProducts(productId, limit);
  res.send(products);
});

const getProductById = catchAsync(async (req, res) => {
  const productId = req.query.productId;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }
  const product = await productService.getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

const updateProduct = catchAsync(async (req, res) => {
  const productId = req.query.productId;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }
  const product = await productService.updateProductById(productId, req.body);
  res.send(product);
});

const deleteProduct = catchAsync(async (req, res) => {
  const productId = req.query.productId;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }
  await productService.deleteProductById(productId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createProduct,
  getProductsBySearch,
  getAllProduct,
  getProductsByCategory,
  getRelatedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
