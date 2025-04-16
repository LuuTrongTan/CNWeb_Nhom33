const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user.model');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { validationResult } = require('express-validator');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      authMethod: 'local'
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      return res.status(200).json({
        success: true,
        requireTwoFactor: true,
        userId: user._id
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  })(req, res, next);
};

// Verify 2FA token
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid authentication code' });
    }

    // Generate JWT
    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Two-factor authentication successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error during 2FA verification' });
  }
};

// Google OAuth login
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

// Google OAuth callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate JWT
    const token = generateToken(user);

    // Redirect to frontend with token
    return res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
  })(req, res, next);
};

// Facebook OAuth login
exports.facebookAuth = passport.authenticate('facebook', {
  scope: ['email'],
  session: false
});

// Facebook OAuth callback
exports.facebookCallback = (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate JWT
    const token = generateToken(user);

    // Redirect to frontend with token
    return res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
  })(req, res, next);
};

// Setup 2FA
exports.setupTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Ecommerce-App:${req.user.email}`
    });
    
    // Save the secret to the user
    await User.findByIdAndUpdate(userId, {
      'twoFactorAuth.secret': secret.base32
    });
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error during 2FA setup' });
  }
};

// Enable 2FA
exports.enableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }
    
    // Enable 2FA
    await User.findByIdAndUpdate(userId, {
      'twoFactorAuth.enabled': true
    });
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ message: 'Server error during 2FA enabling' });
  }
};

// Disable 2FA
exports.disableTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.findByIdAndUpdate(userId, {
      'twoFactorAuth.enabled': false,
      'twoFactorAuth.secret': null
    });
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error during 2FA disabling' });
  }
}; 