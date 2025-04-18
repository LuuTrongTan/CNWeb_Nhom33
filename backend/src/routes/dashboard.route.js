const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  getRevenueReports,
  getCustomerAnalytics,
  getInventoryReports,
  getSalesPerformance,
  getDashboardSummary,
} = require("../controllers/dashboard.controller");

// Chỉ admin mới có quyền truy cập dashboard (vì họ có quyền 'manageUsers')
router.use(auth('manageUsers'));

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