const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); // Đồng nhất với đường dẫn chuẩn
const config = require('../config/config');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      authType: 'local',
      role: 'user',
    });

    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.authType !== 'local' || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Không có token' });
    }

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      const existingLocalUser = await User.findOne({ email: decoded.email, authType: 'local' });
      if (existingLocalUser) {
        return res.status(400).json({ message: 'Email này đã đăng ký với tài khoản local' });
      }

      user = new User({
        email: decoded.email,
        name: decoded.name || 'Google User',
        avatar: { url: decoded.picture || '' },
        isVerified: true,
        authType: 'google',
        role: 'user',
      });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });
    res.json({ user, token: authToken });
  } catch (error) {
    console.error('Lỗi đăng nhập Google:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};


module.exports = {
  register,
  login,
  googleLogin,
};