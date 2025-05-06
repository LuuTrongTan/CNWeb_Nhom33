const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const { Schema } = mongoose;

// Define the Picture schema
const pictureSchema = new Schema(
  {
    link: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, //  Tự động thêm createdAt và updatedAt
  }
);

pictureSchema.plugin(toJSON);

// Create the Picture model
const Picture = mongoose.model('Picture', pictureSchema);

module.exports = Picture;
