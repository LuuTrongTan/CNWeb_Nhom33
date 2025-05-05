const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user.model');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');

const googleAuth = catchAsync(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Không có token');
  }

  const decoded = jwt.decode(token);
  if (!decoded || !decoded.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token không hợp lệ');
  }

  let user = await User.findOne({ email: decoded.email });

  if (!user) {
    const existingLocalUser = await User.findOne({ email: decoded.email, authType: 'local' });
    if (existingLocalUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email này đã đăng ký với tài khoản local');
    }

    user = await userService.createUser({
      email: decoded.email,
      name: decoded.name || 'Google User',
      avatar: decoded.picture || null,
      isEmailVerified: true,
      authType: 'google',
      role: 'user',
    });
  }

  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

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
};
