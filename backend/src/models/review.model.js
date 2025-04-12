const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const { Schema } = mongoose;

const feedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  nameTag: {
    type: String,
    required: true,
    default: '',
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  },
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  },
  listFeedback: [feedbackSchema],
});

// 👉 Thêm plugin paginate vào schema
reviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Review', reviewSchema);
