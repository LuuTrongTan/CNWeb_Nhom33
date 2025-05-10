const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

// Lấy giỏ hàng của người dùng hiện tại
const getUserCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const cart = await cartService.getUserCart(userId);
  
  // Định dạng lại giỏ hàng để trả về cho frontend
  const formattedCart = {
    ...cart.toJSON(),
    items: cart.items.map(item => ({
      product: item.product,
      id: item.product,
      cartItemId: item.cartItemId, // Thêm cartItemId vào response
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      hasDiscount: item.hasDiscount,
      name: item.name,
      image: item.image,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    }))
  };
  
  res.status(httpStatus.OK).send(formattedCart);
});

// Kiểm tra tồn kho của sản phẩm
const checkProductStock = async (product, quantity) => {
  // Kiểm tra sản phẩm có đủ số lượng trong kho không
  if (product.stock === undefined || product.stock < quantity) {
    return {
      hasStock: false,
      availableStock: product.stock || 0,
      message: product.stock === 0 
        ? 'Sản phẩm đã hết hàng' 
        : `Chỉ còn ${product.stock} sản phẩm trong kho`
    };
  }
  
  return { hasStock: true };
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1, selectedSize, selectedColor } = req.body;
  
  const cart = await cartService.addToCart(userId, { productId, quantity, selectedSize, selectedColor });
  
  // Định dạng lại giỏ hàng để trả về cho frontend
  const formattedCart = {
    ...cart.toJSON(),
    items: cart.items.map(item => ({
      product: item.product,
      id: item.product,
      cartItemId: item.cartItemId,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      hasDiscount: item.hasDiscount,
      name: item.name,
      image: item.image,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    }))
  };
  
  res.status(httpStatus.OK).send(formattedCart);
});

// Cập nhật sản phẩm trong giỏ hàng
const updateCartItem = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId, cartItemId, quantity, selectedSize, selectedColor } = req.body;
  
  const cart = await cartService.updateCartItem(userId, { productId, cartItemId, quantity, selectedSize, selectedColor });
  
  // Định dạng lại giỏ hàng để trả về cho frontend
  const formattedCart = {
    ...cart.toJSON(),
    items: cart.items.map(item => ({
      product: item.product,
      id: item.product,
      cartItemId: item.cartItemId,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      hasDiscount: item.hasDiscount,
      name: item.name,
      image: item.image,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    }))
  };
  
  res.status(httpStatus.OK).send(formattedCart);
});

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params; // productId có thể là productId hoặc cartItemId
  
  const cart = await cartService.removeCartItem(userId, productId);
  
  // Định dạng lại giỏ hàng để trả về cho frontend
  const formattedCart = {
    ...cart.toJSON(),
    items: cart.items.map(item => ({
      product: item.product,
      id: item.product,
      cartItemId: item.cartItemId,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      hasDiscount: item.hasDiscount,
      name: item.name,
      image: item.image,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    }))
  };
  
  res.status(httpStatus.OK).send(formattedCart);
});

// Xóa toàn bộ giỏ hàng
const clearCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const cart = await cartService.clearCart(userId);
  res.status(httpStatus.OK).send(cart);
});

// Đồng bộ giỏ hàng từ localStorage sau khi đăng nhập
const syncCartFromLocal = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;
  
  const result = await cartService.syncCartFromLocal(userId, items);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCartFromLocal
}; 