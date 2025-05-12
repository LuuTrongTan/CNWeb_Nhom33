const httpStatus = require('http-status');
const { Cart, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

/**
 * Lấy giỏ hàng của người dùng
 * @param {ObjectId} userId
 * @returns {Promise<Cart>}
 */
const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // Tạo giỏ hàng mới nếu chưa có
    cart = await Cart.create({
      user: userId,
      items: [],
    });
    return cart;
  }

  // Kiểm tra tính hợp lệ của sản phẩm trong giỏ hàng
  const updatedItems = [];
  const invalidItems = [];

  for (const item of cart.items) {
    try {
      const product = await Product.findById(item.product);
      if (product) {
        // Cập nhật giá mới nhất
        const currentPrice = product.hasDiscount ? product.discountPrice : product.price;
        if (item.price !== currentPrice) {
          item.price = currentPrice;
        }

        // Cập nhật giá gốc và trạng thái khuyến mãi
        item.originalPrice = product.price;
        item.hasDiscount = product.hasDiscount;

        // Đảm bảo mỗi item có cartItemId
        if (!item.cartItemId) {
          item.cartItemId = `${item.product.toString()}-${item.selectedSize || 'no-size'}-${
            item.selectedColor || 'no-color'
          }-${Date.now()}`;
        }

        updatedItems.push(item);
      } else {
        invalidItems.push(item);
      }
    } catch (error) {
      console.error(`Lỗi khi kiểm tra sản phẩm ${item.product}:`, error);
      invalidItems.push(item);
    }
  }

  if (invalidItems.length > 0) {
    cart.items = updatedItems;
    await cart.save();
  }

  return cart;
};

/**
 * Kiểm tra tồn kho của sản phẩm
 * @param {Object} product
 * @param {number} quantity
 * @returns {Object} { hasStock, availableStock, message }
 */
const checkProductStock = (product, quantity) => {
  // Kiểm tra sản phẩm có đủ số lượng trong kho không
  if (product.stock === undefined || product.stock < quantity) {
    return {
      hasStock: false,
      availableStock: product.stock || 0,
      message: product.stock === 0 ? 'Sản phẩm đã hết hàng' : `Chỉ còn ${product.stock} sản phẩm trong kho`,
    };
  }

  return { hasStock: true };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {ObjectId} userId
 * @param {Object} productData
 * @returns {Promise<Cart>}
 */
const addToCart = async (userId, productData) => {
  const { productId, quantity = 1, selectedSize, selectedColor } = productData;

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  // Kiểm tra tồn kho
  const stockStatus = checkProductStock(product, quantity);
  if (!stockStatus.hasStock) {
    throw new ApiError(httpStatus.BAD_REQUEST, stockStatus.message);
  }

  // Tìm giỏ hàng hiện tại hoặc tạo mới
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  } else {
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng với cùng size và color chưa
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor
    );

    if (existingItem) {
      // Kiểm tra tổng số lượng sau khi thêm
      const totalQuantity = existingItem.quantity + quantity;
      const stockStatusForTotal = checkProductStock(product, totalQuantity);
      if (!stockStatusForTotal.hasStock) {
        throw new ApiError(httpStatus.BAD_REQUEST, stockStatusForTotal.message);
      }
    }
  }

  // Chuẩn bị dữ liệu sản phẩm để thêm vào giỏ hàng
  const itemData = {
    product: productId,
    quantity,
    price: product.hasDiscount ? product.discountPrice : product.price,
    originalPrice: product.price,
    hasDiscount: product.hasDiscount,
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images[0] : null,
    selectedSize,
    selectedColor,
    soldCount: product.soldCount,
  };

  // Thêm sản phẩm vào giỏ hàng
  await cart.addItem(itemData);

  return cart;
};

/**
 * Cập nhật sản phẩm trong giỏ hàng
 * @param {ObjectId} userId
 * @param {Object} updateData
 * @returns {Promise<Cart>}
 */
const updateCartItem = async (userId, updateData) => {
  const { productId, cartItemId, quantity, selectedSize, selectedColor } = updateData;

  // Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sản phẩm không tồn tại');
  }

  // Kiểm tra tồn kho (nếu cập nhật số lượng)
  if (quantity) {
    const stockStatus = checkProductStock(product, quantity);
    if (!stockStatus.hasStock) {
      throw new ApiError(httpStatus.BAD_REQUEST, stockStatus.message);
    }
  }

  // Tìm giỏ hàng
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy giỏ hàng');
  }

  // Tìm sản phẩm hiện tại trong giỏ hàng
  let currentItem;

  // Nếu có cartItemId, tìm theo cartItemId
  if (cartItemId) {
    currentItem = cart.items.find((item) => item.cartItemId === cartItemId);
  }

  // Nếu không tìm thấy theo cartItemId hoặc không có cartItemId, tìm theo productId (tương thích ngược)
  if (!currentItem) {
    currentItem = cart.items.find((item) => item.product.toString() === productId);
  }

  if (!currentItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy sản phẩm trong giỏ hàng');
  }

  // Kiểm tra xem đã có sản phẩm trùng lặp (cùng ID, và size/color giống với thay đổi)
  if (selectedSize !== undefined || selectedColor !== undefined) {
    const newSize = selectedSize !== undefined ? selectedSize : currentItem.selectedSize;
    const newColor = selectedColor !== undefined ? selectedColor : currentItem.selectedColor;

    const duplicateItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === newSize &&
        item.selectedColor === newColor &&
        item.cartItemId !== cartItemId &&
        item !== currentItem
    );

    if (duplicateItem) {
      // Có sản phẩm trùng lặp - hợp nhất chúng
      const newQuantity = (quantity || currentItem.quantity) + duplicateItem.quantity;

      // Kiểm tra tồn kho cho tổng số lượng mới
      const stockStatus = checkProductStock(product, newQuantity);
      if (!stockStatus.hasStock) {
        throw new ApiError(httpStatus.BAD_REQUEST, stockStatus.message);
      }

      // Cập nhật số lượng cho sản phẩm trùng
      duplicateItem.quantity = newQuantity;

      // Xóa sản phẩm hiện tại
      cart.items = cart.items.filter((item) => item !== currentItem);

      cart.markModified('items');
      await cart.save();

      return cart;
    }
  }

  // Không có trùng lặp, cập nhật bình thường
  // Sử dụng cartItemId trong trường hợp có cung cấp, ngược lại dùng productId
  const itemId = cartItemId || productId;
  await cart.updateItem(itemId, { quantity, selectedSize, selectedColor });

  return cart;
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {ObjectId} userId
 * @param {string} itemId - Có thể là productId hoặc cartItemId
 * @returns {Promise<Cart>}
 */
const removeCartItem = async (userId, itemId) => {
  // Tìm giỏ hàng
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy giỏ hàng');
  }

  // Kiểm tra xem itemId là MongoDB ObjectId (productId) hay cartItemId
  const isValidObjectId = mongoose.Types.ObjectId.isValid(itemId);

  // Nếu là ObjectId hợp lệ, xử lý theo cách cũ (tương thích với API cũ)
  if (isValidObjectId) {
    await cart.removeItem(itemId);
  } else {
    // Nếu không phải ObjectId, giả định đây là cartItemId
    // Tìm sản phẩm dựa trên cartItemId
    const itemToRemove = cart.items.find((item) => item.cartItemId === itemId);

    if (!itemToRemove) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Cập nhật mảng items, loại bỏ item có cartItemId trùng khớp
    cart.items = cart.items.filter((item) => item.cartItemId !== itemId);
    cart.lastUpdated = Date.now();
    await cart.save();
  }

  return cart;
};

/**
 * Xóa toàn bộ giỏ hàng
 * @param {ObjectId} userId
 * @returns {Promise<Cart>}
 */
const clearCart = async (userId) => {
  // Tìm giỏ hàng
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy giỏ hàng');
  }

  // Xóa toàn bộ giỏ hàng
  await cart.clearCart();

  return cart;
};

/**
 * Đồng bộ giỏ hàng từ localStorage
 * @param {ObjectId} userId
 * @param {Array} items
 * @returns {Promise<Object>} { cart, warnings }
 */
const syncCartFromLocal = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Dữ liệu giỏ hàng không hợp lệ');
  }

  // Tìm giỏ hàng hoặc tạo mới
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  // Xử lý từng sản phẩm trong giỏ hàng từ localStorage
  const errorMessages = [];

  for (const item of items) {
    try {
      // Lấy productId từ item (hỗ trợ cả id và productId để tương thích)
      const productId = item.productId || item.id;
      if (!productId) {
        errorMessages.push('Sản phẩm không có ID hợp lệ');
        continue;
      }

      // Kiểm tra sản phẩm tồn tại
      const product = await Product.findById(productId);

      if (product) {
        // Kiểm tra tồn kho
        const stockStatus = checkProductStock(product, item.quantity);
        if (stockStatus.hasStock) {
          // Chuẩn bị dữ liệu sản phẩm
          const productData = {
            product: productId,
            quantity: item.quantity || 1,
            price: product.hasDiscount ? product.discountPrice : product.price,
            originalPrice: product.price,
            hasDiscount: product.hasDiscount,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            soldCount: item.soldCount,
          };

          // Thêm vào giỏ hàng
          await cart.addItem(productData);
        } else {
          errorMessages.push(`Sản phẩm ${product.name}: ${stockStatus.message}`);
        }
      } else {
        errorMessages.push(`Sản phẩm với ID ${productId} không tồn tại`);
      }
    } catch (error) {
      console.error(`Lỗi khi thêm sản phẩm vào giỏ hàng:`, error);
      errorMessages.push(`Không thể thêm sản phẩm vào giỏ hàng`);
    }
  }

  return { cart, warnings: errorMessages };
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  syncCartFromLocal,
  checkProductStock,
};
