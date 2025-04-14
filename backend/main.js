// server.js - Backend cho giỏ hàng và thanh toán
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

// Mô hình dữ liệu đơn hàng
const OrderSchema = new mongoose.Schema({
    items: Array,
    total: Number,
    status: { type: String, default: "pending" },
    shippingInfo: Object,
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", OrderSchema);

// API tạo đơn hàng
app.post("/api/orders", async (req, res) => {
    try {
        const { items, total, shippingInfo } = req.body;
        const order = new Order({ items, total, shippingInfo });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: "Lỗi tạo đơn hàng" });
    }
});

// API lấy trạng thái đơn hàng
app.get("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy thông tin đơn hàng" });
    }
});

// API thanh toán qua Stripe
app.post("/api/checkout", async (req, res) => {
    try {
        const { total, items, shippingInfo } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100,
            currency: "vnd",
        });

        const order = new Order({ items, total, shippingInfo, status: "processing" });
        await order.save();

        res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
    } catch (error) {
        res.status(500).json({ error: "Lỗi thanh toán" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
