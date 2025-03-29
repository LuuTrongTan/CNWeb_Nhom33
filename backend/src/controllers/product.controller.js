const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { productService } = require('../services');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(product);
});

// $in thì  bất kỳ sản phẩm nào có ít nhất một giá trị trong danh sách. còn $all thì  sản phẩm phải chứa tất cả các giá trị được chỉ định.
const getProducts = catchAsync(async (req, res) => {
  const filter = {
    ...(req.query.category && { category: { $in: req.query.category } }),
    ...(req.query.size && { sizes: { $all: req.query.size.split(',') } }),
    ...(req.query.color && { colors: { $in: req.query.color } }),
    ...(req.query.price && {
      price: {
        $gte: Number(req.query.price.split('-')[0]),
        $lte: Number(req.query.price.split('-')[1]),
      },
    }),
    ...(req.query.name && { name: { $regex: req.query.name, $options: 'i' } }),
  };

  const options = {
    page: req.query.page,
    limit: req.query.limit,
    sortBy: req.query.sortBy,
  };

  const result = await productService.queryProduct(filter, options);
  res.send(result);
});
const getAllProduct = catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query; // Lấy giá trị từ request query

  const products = await productService.getAllProduct(parseInt(page), parseInt(limit));
  if (!products) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.send(products);
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
