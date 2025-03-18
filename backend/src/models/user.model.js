const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return this.authType === 'local';
    },
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    url: {
      type: String,
      default: 'https://upload.wikimedia.org/wikipedia/vi/thumb/e/ef/Logo_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_B%C3%A1ch_Khoa_H%C3%A0_N%E1%BB%99i.svg/375px-Logo_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_B%C3%A1ch_Khoa_H%C3%A0_N%E1%BB%99i.svg.png?20210110184431', // Ảnh mặc định
    },
    public_id: {
      type: String,
      default: null,
    },
  },
  addresses: [
    {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: Boolean,
    },
  ],
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Tham chiếu đến collection Product
        required: true,
      },
      name: String, // Giữ để hiển thị
      price: Number, // Giữ để hiển thị
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: null,
    select: false,
  },
  verificationCodeExpires: {
    type: Date,
    default: null,
    select: false,
  },
  authType: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  googleId: String,
  facebookId: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: String,
}, { timestamps: true });

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;