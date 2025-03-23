const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      district: String,
      ward: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit_card", "bank_transfer", "e_wallet"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["processing", "shipping", "delivered", "completed", "cancelled"],
      default: "processing",
    },
    shippingStatus: {
      type: String,
      required: true,
      enum: ["pending", "picked_up", "in_transit", "delivered", "returned"],
      default: "pending",
    },
    shippingProvider: {
      type: String,
      enum: ["GHTK", "GHN", "ViettelPost"],
    },
    trackingNumber: String,
    shippingFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discount: {
      code: String,
      amount: Number,
    },
    notes: String,
    returnRequest: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: null,
      },
      reason: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
