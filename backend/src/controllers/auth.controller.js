const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');
const passport = require("passport");

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Không có token' });
        }

        // Giải mã token nhận được từ Google
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Token không hợp lệ' });
        }

        let user = await User.findOne({ email: decoded.email });

        if (!user) {
            // Kiểm tra xem email đã được đăng ký bằng tài khoản local chưa
            const existingLocalUser = await User.findOne({ email: decoded.email, authType: 'local' });
            if (existingLocalUser) {
                return res.status(400).json({ message: 'Email này đã đăng ký với tài khoản local' });
            }

            // Tạo user mới không cần mật khẩu
            user = new User({
                email: decoded.email,
                name: decoded.name || 'Google User',
                avatar: decoded.picture || '',
                isVerified: true,  // Google đã xác thực email
                authType: 'google',
            });

            await user.save();
        }

        // Tạo JWT token
        const authToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });

        res.json({ user, token: authToken });
    } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        res.status(500).json({ message: 'Lỗi server', error });
    }
};

const facebookLogin = async (req, res) => {
    const { accessToken } = req.body;
    try {
        const response = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        );
        const data = await response.json();

        if (!data.id) {
            return res.status(400).json({ message: "Invalid Facebook token" });
        }

        let user = await User.findOne({ email: data.email });
        if (!user) {
            user = new User({
                name: data.name,
                email: data.email,
                avatar: data.picture.data.url,
                role: "user",
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user });
    } catch (error) {
        console.error("Facebook login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { 
    googleLogin,
    facebookLogin,
};
