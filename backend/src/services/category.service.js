const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

const createCategory = async (categoryBody) => {
  return await Category.create(categoryBody);
};

const getAllCategory = async () => {
  return Category.find();
};

const getCategoryById = async (id) => {
  return Category.findById(id);
};

// const updateProductById = async (productId, updateBody) => {
//   const product = await getProductById(productId);
//   if (!product) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
//   }

//   Object.assign(product, updateBody);
//   await product.save();
//   return product;
// };

// const deleteProductById = async (productId) => {
//   const product = await getProductById(productId);
//   if (!product) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
//   }

//   await product.remove();
//   return product;
// };

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  //   getAllProduct,
  //   getProductById,
  //   updateProductById,
  //   deleteProductById,
};
