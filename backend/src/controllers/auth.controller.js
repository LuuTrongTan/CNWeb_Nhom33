const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user.model');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.send(user);
});

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Không có credential' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Tạo user mới với thông tin từ Google
      user = new User({
        email: payload.email,
        name: payload.name || 'Google User',
        avatar: { url: payload.picture || '' },
        isEmailVerified: true,
        authType: 'google',
        role: 'user'
      });
      await user.save();
    } else if (user.authType === 'local') {
      // Nếu email đã tồn tại với tài khoản local
      return res.status(400).json({ 
        message: 'Email này đã được đăng ký bằng tài khoản local. Vui lòng đăng nhập bằng mật khẩu.' 
      });
    }

    // Sử dụng cùng hệ thống token với local account
    const tokens = await tokenService.generateAuthTokens(user);

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        address: user.address,
        phone: user.phone,
        avatar: user.avatar
      }, 
      tokens 
    });
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const register = catchAsync(async (req, res) => {
  const userData = { ...req.body, role: 'user' };
  const user = await userService.createUser(userData);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleAuth,
  getMe,
};
