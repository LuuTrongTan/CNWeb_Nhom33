const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");
const {
  createOrder,
  updateOrderStatus,
  handleReturnRequest,
  updateReturnStatus,
  getOrder,
  getUserOrders,
} = require("../controllers/orderController");

// Routes cho người dùng
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/:orderId", protect, getOrder);
router.post("/:orderId/return", protect, handleReturnRequest);

// Routes cho admin
router.patch(
  "/:orderId/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);
router.patch(
  "/:orderId/return-status",
  protect,
  authorize("admin"),
  updateReturnStatus
);

module.exports = router;
