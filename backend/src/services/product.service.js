const httpStatus = require('http-status');
const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

const createProduct = async (productBody) => {
  return await Product.create(productBody);
};

const queryProduct = async (filter, options) => {
  const paginateOptions = {
    page: parseInt(options.page, 10) || 1,
    limit: parseInt(options.limit, 10) || 12,
    sort: options.sortBy || '-createdAt', // Sắp xếp theo ngày tạo mới nhất
  };

  return await Product.paginate(filter, paginateOptions);
};

const getAllProduct = async (page = 1, limit = 12) => {
  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;

  const products = await Product.find()
    .skip((page - 1) * limit) // Bỏ qua sản phẩm của các trang trước
    .limit(limit); // Giới hạn số lượng sản phẩm mỗi trang

  const total = await Product.countDocuments(); // Tổng số sản phẩm

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };
};

const getProductsByCategory = async (categoryId, page = 1, limit = 12) => {
  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1) page = 1;

  const products = await Product.find({ category: categoryId })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category', 'name');

  const total = await Product.countDocuments({ category: categoryId });

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: products,
  };
};

const getRelatedProducts = async (productId, limit = 4) => {
  const product = await getProductById(productId);
  
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  // Lấy sản phẩm cùng danh mục, loại trừ sản phẩm hiện tại
  const relatedProducts = await Product.find({ 
    category: product.category,
    _id: { $ne: productId }
  })
  .limit(limit)
  .select('name price images');
  
  return relatedProducts;
};

const getProductById = async (id) => {
  return Product.findById(id).populate('category', 'name');
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
  getProductsByCategory,
  getRelatedProducts,
  updateProductById,
  deleteProductById,
};
