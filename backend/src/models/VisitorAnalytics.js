const mongoose = require("mongoose");

const visitorAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    totalVisits: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    newVisitors: {
      type: Number,
      default: 0,
    },
    returningVisitors: {
      type: Number,
      default: 0,
    },
    averageSessionDuration: {
      type: Number, // in seconds
      default: 0,
    },
    // Page views by category
    pageViews: {
      home: { type: Number, default: 0 },
      products: { type: Number, default: 0 },
      categories: { type: Number, default: 0 },
      checkout: { type: Number, default: 0 },
      account: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    // Traffic sources
    sources: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    // Device distribution
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    // Conversion metrics
    conversions: {
      productViews: { type: Number, default: 0 },
      addToCart: { type: Number, default: 0 },
      checkout: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
    },
    bounceRate: {
      type: Number, // percentage
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on date for efficient querying
visitorAnalyticsSchema.index({ date: 1 });

module.exports = mongoose.model("VisitorAnalytics", visitorAnalyticsSchema); 