const mongoose = require("mongoose");

const salesAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    // Revenue metrics
    revenue: {
      type: Number,
      default: 0,
    },
    // Breakdown by payment method
    revenueByPaymentMethod: {
      credit_card: {
        type: Number,
        default: 0,
      },
      bank_transfer: {
        type: Number,
        default: 0,
      },
      e_wallet: {
        type: Number,
        default: 0,
      },
    },
    // Orders metrics
    orders: {
      type: Number,
      default: 0,
    },
    // Average order value
    avgOrderValue: {
      type: Number,
      default: 0,
    },
    // Products sold
    productsSold: {
      type: Number,
      default: 0,
    },
    // Sales by category
    salesByCategory: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    // New vs returning customers
    newCustomers: {
      type: Number,
      default: 0,
    },
    returningCustomers: {
      type: Number,
      default: 0,
    },
    // Discounts total
    discountAmount: {
      type: Number,
      default: 0,
    },
    // Shipping total
    shippingAmount: {
      type: Number,
      default: 0,
    },
    // Returns and refunds
    returns: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    // Campaign tracking
    campaignData: [
      {
        campaignId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Campaign",
        },
        name: String,
        revenue: {
          type: Number,
          default: 0,
        },
        orders: {
          type: Number,
          default: 0,
        },
        conversion: {
          type: Number, // percentage
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a compound index on date for efficient querying
salesAnalyticsSchema.index({ date: 1 });

module.exports = mongoose.model("SalesAnalytics", salesAnalyticsSchema); 