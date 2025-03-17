const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['price', 'category', 'name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getAllProduct = catchAsync(async (req, res) => {
  const product = await productService.getAllProduct();
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(product);
});

const getProduct = catchAsync(async (req, res) => {
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
  getProducts,
  getAllProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
