const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo mỗi người dùng chỉ đánh giá một sản phẩm một lần
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// add plugin that converts mongoose to json
reviewSchema.plugin(toJSON);
reviewSchema.plugin(paginate);

/**
 * @typedef Review
 */
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
