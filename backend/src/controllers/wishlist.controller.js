const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { wishlistService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Lấy wishlist của user đang đăng nhập
 */
const getMyWishlist = catchAsync(async (req, res) => {
  const wishlist = await wishlistService.getWishlistByUserId(req.user.id);
  res.send(wishlist);
});

/**
 * Thêm sản phẩm vào wishlist
 */
const addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu productId');
  }
  
  const wishlist = await wishlistService.addProductToWishlist(req.user.id, productId);
  res.status(httpStatus.OK).send(wishlist);
});

/**
 * Xóa sản phẩm khỏi wishlist
 */
const removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu productId');
  }
  
  const wishlist = await wishlistService.removeProductFromWishlist(req.user.id, productId);
  res.status(httpStatus.OK).send(wishlist);
});

/**
 * Kiểm tra sản phẩm có trong wishlist không
 */
const checkProductInWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Thiếu productId');
  }
  
  const isInWishlist = await wishlistService.isProductInWishlist(req.user.id, productId);
  res.status(httpStatus.OK).send({ isInWishlist });
});

module.exports = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkProductInWishlist,
}; 