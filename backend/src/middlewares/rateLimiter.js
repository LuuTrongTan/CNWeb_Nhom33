const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 6, // Giới hạn request trong 5 phút
  message: {
    status: 'error',
    message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Trả về rate limit info trong headers
  legacyHeaders: false, // Không sử dụng X-RateLimit-* headers
  skipSuccessfulRequests: false, // Đếm cả request thành công
});

module.exports = {
  authLimiter,
};
