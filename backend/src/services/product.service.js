const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

const createProduct = async (productBody) => {
  return await Product.create(productBody);
};

const queryProduct = async (filter, options) => {
  const products = await Product.paginate(filter, options);
  return products;
};

const getAllProduct = async () => {
  return Product.find();
};

const getProductById = async (id) => {
  return Product.findById(id);
};

const updateProductById = async (productId, updateBody) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  Object.assign(product, updateBody);
  await product.save();
  return product;
};

const deleteProductById = async (productId) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  await product.remove();
  return product;
};

module.exports = {
  createProduct,
  queryProduct,
  getAllProduct,
  getProductById,
  updateProductById,
  deleteProductById,
};
