const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { paginate } = require('./plugins');

const orderItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
  },
  {
    _id: false,
  }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: false, // Cho phép đặt hàng không cần đăng nhập
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      ward: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'banking', 'momo', 'card'],
      default: 'cod',
    },
    shippingMethod: {
      type: String,
      required: true,
      enum: ['standard', 'fast', 'express'],
      default: 'standard',
    },
    totalItemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Đảm bảo trường này không thể thay đổi sau khi đã tạo
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // Vô hiệu hóa tự động tạo timestamps để sử dụng cấu hình tùy chỉnh ở trên
    timestamps: false
  }
);

// Thêm plugin
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

// Tạo mã đơn hàng tự động trước khi lưu
orderSchema.pre('save', async function (next) {
  const order = this;
  if (!order.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    order.orderNumber = `DH${year}${month}${day}${random}`;
    
    // Tính tổng tiền đơn hàng
    order.totalAmount = order.totalItemsPrice + order.shippingPrice;
  }
  next();
});

// Thêm middleware pre update để đảm bảo createdAt không bị thay đổi
orderSchema.pre('findOneAndUpdate', function (next) {
  // Xóa trường createdAt khỏi update nếu có
  if (this._update && this._update.createdAt) {
    console.log('Ngăn cản thay đổi createdAt trong quá trình update đơn hàng');
    delete this._update.createdAt;
  }
  next();
});

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 