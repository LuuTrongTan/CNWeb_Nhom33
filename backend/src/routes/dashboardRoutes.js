const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  getRevenueReports,
  getCustomerAnalytics,
  getInventoryReports,
  getSalesPerformance,
  getDashboardSummary,
} = require("../controllers/dashboardController");

// Only admin and managers should have access to dashboard
router.use(protect, authorize("admin", "manager"));

// Dashboard summary
router.get("/summary", getDashboardSummary);

// Revenue reports
router.get("/revenue", getRevenueReports);

// Customer analytics
router.get("/customers", getCustomerAnalytics);

// Inventory reports
router.get("/inventory", getInventoryReports);

// Sales performance
router.get("/sales-performance", getSalesPerformance);

module.exports = router; 