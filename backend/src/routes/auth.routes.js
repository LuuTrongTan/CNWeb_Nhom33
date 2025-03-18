const express = require('express');
const { googleLogin, facebookLogin } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/google', googleLogin); // Xử lý đăng nhập Google

router.post("/facebook", facebookLogin); // Xử lý đăng nhập Facebook

module.exports = router;
