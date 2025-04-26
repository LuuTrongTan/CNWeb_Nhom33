const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const wishlistSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

// Thêm plugin để chuyển đổi mongoose sang json
wishlistSchema.plugin(toJSON);
wishlistSchema.plugin(paginate);

/**
 * @typedef Wishlist
 */
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist; 