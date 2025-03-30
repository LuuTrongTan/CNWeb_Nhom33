const express = require('express');
const { googleLogin } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/google', googleLogin); // Xử lý đăng nhập Google

module.exports = router;
