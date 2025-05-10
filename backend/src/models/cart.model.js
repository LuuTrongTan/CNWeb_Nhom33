const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cartItemId: {
    type: String,
    default: function() {
      // Tạo cartItemId duy nhất dựa trên productId + size + color + timestamp
      const productId = this.product.toString();
      const size = this.selectedSize || 'no-size';
      const color = this.selectedColor || 'no-color';
      return `${productId}-${size}-${color}-${Date.now()}`;
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedSize: {
    type: String,
    default: null
  },
  selectedColor: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    default: null
  },
  hasDiscount: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  }
}, { _id: false });

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Thêm plugin để chuyển đổi Mongoose thành JSON
cartSchema.plugin(toJSON);

// Phương thức thêm sản phẩm vào giỏ hàng
cartSchema.methods.addItem = async function(productData) {
  // Tìm sản phẩm dựa trên productId, selectedSize và selectedColor
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productData.product.toString() &&
           item.selectedSize === productData.selectedSize &&
           item.selectedColor === productData.selectedColor
  );

  if (existingItemIndex > -1) {
    // Nếu sản phẩm đã có trong giỏ hàng với cùng size và color, cập nhật số lượng
    this.items[existingItemIndex].quantity += productData.quantity;
  } else {
    // Nếu là sản phẩm mới hoặc có size/color khác, thêm mới vào giỏ hàng
    // Đảm bảo có cartItemId duy nhất
    if (!productData.cartItemId) {
      const productId = productData.product.toString();
      const size = productData.selectedSize || 'no-size';
      const color = productData.selectedColor || 'no-color';
      productData.cartItemId = `${productId}-${size}-${color}-${Date.now()}`;
    }
    this.items.push(productData);
  }

  this.lastUpdated = Date.now();
  return this.save();
};

// Phương thức xóa sản phẩm khỏi giỏ hàng
cartSchema.methods.removeItem = async function(itemId) {
  // Kiểm tra xem itemId là productId hay cartItemId
  // Nếu là cartItemId, lọc theo cartItemId
  if (this.items.some(item => item.cartItemId === itemId)) {
    this.items = this.items.filter(item => item.cartItemId !== itemId);
  } 
  // Nếu không tìm thấy theo cartItemId hoặc không phải cartItemId, lọc theo productId (cách cũ)
  else {
    this.items = this.items.filter(item => item.product.toString() !== itemId);
  }
  
  this.lastUpdated = Date.now();
  return this.save();
};

// Phương thức cập nhật sản phẩm trong giỏ hàng
cartSchema.methods.updateItem = async function(itemId, updateData) {
  // Kiểm tra xem itemId là productId hay cartItemId
  let item;
  
  if (this.items.some(i => i.cartItemId === itemId)) {
    // Tìm theo cartItemId
    item = this.items.find(i => i.cartItemId === itemId);
  } else {
    // Tìm theo productId (cách cũ, giữ lại để tương thích)
    item = this.items.find(i => i.product.toString() === itemId);
  }
  
  if (item) {
    // Cập nhật số lượng
    if (updateData.quantity) {
      if (updateData.quantity <= 0) {
        // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
        return this.removeItem(item.cartItemId || itemId);
      }
      item.quantity = updateData.quantity;
    }
    
    // Cập nhật kích thước nếu có
    if (updateData.selectedSize !== undefined) {
      item.selectedSize = updateData.selectedSize;
    }
    
    // Cập nhật màu sắc nếu có
    if (updateData.selectedColor !== undefined) {
      item.selectedColor = updateData.selectedColor;
    }
    
    this.lastUpdated = Date.now();
    return this.save();
  }
  
  return this;
};

// Phương thức xóa toàn bộ giỏ hàng
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.lastUpdated = Date.now();
  return this.save();
};

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 