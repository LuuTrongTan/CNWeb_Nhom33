const httpStatus = require('http-status');
const { Wishlist } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Tạo wishlist cho user
 * @param {ObjectId} userId
 * @returns {Promise<Wishlist>}
 */
const createWishlist = async (userId) => {
  return Wishlist.create({ user: userId, products: [] });
};

/**
 * Lấy wishlist của user
 * @param {ObjectId} userId
 * @returns {Promise<Wishlist>}
 */
const getWishlistByUserId = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wishlist) {
    // Nếu chưa có wishlist, tạo mới một wishlist trống
    return createWishlist(userId);
  }
  return wishlist;
};

/**
 * Thêm sản phẩm vào wishlist
 * @param {ObjectId} userId
 * @param {ObjectId} productId
 * @returns {Promise<Wishlist>}
 */
const addProductToWishlist = async (userId, productId) => {
  const wishlist = await getWishlistByUserId(userId);
  
  // Kiểm tra nếu sản phẩm đã tồn tại trong wishlist
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  
  return wishlist.populate('products');
};

/**
 * Xóa sản phẩm khỏi wishlist
 * @param {ObjectId} userId
 * @param {ObjectId} productId
 * @returns {Promise<Wishlist>}
 */
const removeProductFromWishlist = async (userId, productId) => {
  const wishlist = await getWishlistByUserId(userId);
  
  // Lọc ra các sản phẩm khác productId
  wishlist.products = wishlist.products.filter(
    (product) => product.toString() !== productId.toString()
  );
  
  await wishlist.save();
  return wishlist.populate('products');
};

/**
 * Kiểm tra sản phẩm có trong wishlist không
 * @param {ObjectId} userId
 * @param {ObjectId} productId
 * @returns {Promise<Boolean>}
 */
const isProductInWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    return false;
  }
  
  return wishlist.products.some(
    (product) => product.toString() === productId.toString()
  );
};

module.exports = {
  createWishlist,
  getWishlistByUserId,
  addProductToWishlist,
  removeProductFromWishlist,
  isProductInWishlist,
}; 