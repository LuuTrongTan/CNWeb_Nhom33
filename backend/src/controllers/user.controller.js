const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const emailService = require('../services/email.service');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const client = new OAuth2Client('GOOGLE_CLIENT_ID');

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: 'GOOGLE_CLIENT_ID',
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        googleId: payload.sub,
        authType: 'google',
        isVerified: true,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Google login failed', error });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user) {
      return res.status(404).json({ message: 'Email chưa được đăng ký.' });
    }
    if (user.authType !== 'local') {
      return res.status(400).json({ message: 'Tài khoản này sử dụng đăng nhập qua bên thứ ba (Google/Facebook).' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút
    await user.save();

    await emailService.sendResetPasswordEmail(email, resetCode);
    res.json({ message: 'Mã xác thực đã được gửi vào email của bạn.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    if (user.resetPasswordCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn.' });
    }
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng.' });
    }

    res.json({ message: 'Xác thực thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCode +resetPasswordCodeExpires');

    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    }
    if (user.authType !== 'local') {
      return res.status(400).json({ message: 'Tài khoản này không sử dụng mật khẩu local.' });
    }
    if (user.resetPasswordCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn.' });
    }
    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Mã xác thực không đúng.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }

    // Hash mật khẩu mới trước khi lưu
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpires = null;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.send(user);
});

const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

/**
 * Lấy thông tin giao hàng của người dùng đang đăng nhập
 */
const getUserShippingInfo = catchAsync(async (req, res) => {
  const userId = req.body.userId;
  const shippingInfo = await userService.getUserShippingInfo(userId);
  res.status(httpStatus.OK).send(shippingInfo);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  googleLogin,
  getProfile,
  updateProfile,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  getUserShippingInfo,
};
