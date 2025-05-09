const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  hasDiscount: { type: Boolean, default: false },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tagCategory: {
    type: String,
    required: true,
  },
  images: [{ type: String }],
  mainImage: { type: String, default: '' },
  brand: { type: String },
  tags: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  attributes: [
    {
      name: { type: String },
      value: { type: String },
    },
  ],
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isNewArrival: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  weight: { type: Number, default: 0 }, // weight in grams
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  seoKeywords: [{ type: String }],
  soldCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware để tự động tạo slug từ tên sản phẩm trước khi lưu
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }

  // Tự động cập nhật trường hasDiscount dựa trên giá và giá giảm
  if (this.discountPrice > 0 && this.discountPrice < this.price) {
    this.hasDiscount = true;
  } else {
    this.discountPrice = this.price;
    this.hasDiscount = false;
  }

  this.updatedAt = Date.now();
  next();
});

// Middleware để cập nhật mainImage khi cập nhật sản phẩm
productSchema.pre('save', function (next) {
  if (!this.mainImage && this.images && this.images.length > 0) {
    this.mainImage = this.images[0];
  }
  next();
});

// Middleware để cập nhật updatedAt khi cập nhật sản phẩm
productSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });

  // Xử lý logic discount khi cập nhật
  const update = this.getUpdate();
  if (update.price !== undefined || update.discountPrice !== undefined) {
    const price = update.price !== undefined ? update.price : this._update.$set.price;
    const discountPrice = update.discountPrice !== undefined ? update.discountPrice : this._update.$set.discountPrice;

    if (discountPrice > 0 && discountPrice < price) {
      this.set({ hasDiscount: true });
    } else {
      this.set({ hasDiscount: false, discountPrice: 0 });
    }
  }

  next();
});

// Thêm virtual field để tính phần trăm giảm giá
productSchema.virtual('discountPercentage').get(function () {
  if (!this.hasDiscount) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Thêm virtual field để kiểm tra tình trạng kho hàng
productSchema.virtual('stockStatus').get(function () {
  if (this.stock <= 0) return 'Hết hàng';
  if (this.stock <= this.lowStockThreshold) return 'Sắp hết hàng';
  return 'Còn hàng';
});

// Đảm bảo virtuals được bao gồm khi chuyển đổi sang JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// 👉 Thêm plugin paginate vào schema
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
