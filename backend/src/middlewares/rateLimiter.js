const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 5, // Giới hạn 5 request trong 5 phút
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 5 phút.'
  },
  standardHeaders: true, // Trả về rate limit info trong headers
  legacyHeaders: false, // Không sử dụng X-RateLimit-* headers
  skipSuccessfulRequests: false, // Đếm cả request thành công
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 5 phút.'
    });
  }
});

module.exports = {
  authLimiter,
};
