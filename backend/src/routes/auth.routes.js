const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
// const authMiddleware = require('../middleware/auth.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('name', 'Name is required').not().isEmpty()
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Verify two-factor authentication
router.post(
  '/verify-2fa',
  [
    check('userId', 'User ID is required').not().isEmpty(),
    check('token', 'Token is required').not().isEmpty()
  ],
  authController.verifyTwoFactor
);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Facebook OAuth routes
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);

// Two-factor authentication setup and management
router.get(
  '/setup-2fa',
  authMiddleware.authenticateJWT,
  authController.setupTwoFactor
);

router.post(
  '/enable-2fa',
  [
    check('token', 'Token is required').not().isEmpty()
  ],
  authMiddleware.authenticateJWT,
  authController.enableTwoFactor
);

router.post(
  '/disable-2fa',
  authMiddleware.authenticateJWT,
  authController.disableTwoFactor
);

module.exports = router; 