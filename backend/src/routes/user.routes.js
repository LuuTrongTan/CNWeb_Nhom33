const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticateJWT);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put(
  '/profile',
  [
    check('name', 'Name cannot be empty if provided').optional().notEmpty(),
    check('phone', 'Invalid phone number').optional().isMobilePhone(),
    check('bio', 'Bio cannot be empty if provided').optional().notEmpty()
  ],
  userController.updateProfile
);

// Update password
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.updatePassword
);

// Address management
router.post(
  '/addresses',
  [
    check('street', 'Street address is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('state', 'State is required').not().isEmpty(),
    check('zipCode', 'Zip code is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('isDefault', 'isDefault must be a boolean').optional().isBoolean()
  ],
  userController.addAddress
);

router.put(
  '/addresses/:addressId',
  [
    check('street', 'Street cannot be empty if provided').optional().notEmpty(),
    check('city', 'City cannot be empty if provided').optional().notEmpty(),
    check('state', 'State cannot be empty if provided').optional().notEmpty(),
    check('zipCode', 'Zip code cannot be empty if provided').optional().notEmpty(),
    check('country', 'Country cannot be empty if provided').optional().notEmpty(),
    check('isDefault', 'isDefault must be a boolean').optional().isBoolean()
  ],
  userController.updateAddress
);

router.delete('/addresses/:addressId', userController.deleteAddress);

module.exports = router; 