const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const passport = require("passport");
require('./config/passport');

// Import routes
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
// Các route khác sẽ được import ở đây

// Khởi tạo app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log("✅ Kết nối MongoDB thành công"))
    .catch(err => console.log("❌ Lỗi kết nối MongoDB:", err));
  

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// Các route khác sẽ được thêm ở đây
// Route mẫu để kiểm tra API
app.get('/', (req, res) => {
    res.send('Backend đang chạy!');
  });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
});

module.exports = app;