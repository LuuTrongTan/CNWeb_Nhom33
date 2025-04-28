const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const userValidation = require('../validations/user.validation');

const router = express.Router();

// Get user profile
router.get('/profile', auth('getProfile'), userController.getProfile);

// Update user profile
router.patch(
  '/profile',
  auth('updateProfile'),
  validate(userValidation.updateProfile),
  userController.updateProfile
);

// Update password
router.put(
  '/password',
  auth('updatePassword'),
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.updatePassword
);

// Address management
router.post(
  '/addresses',
  auth('manageAddresses'),
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
  auth('manageAddresses'),
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

router.delete('/addresses/:addressId', auth('manageAddresses'), userController.deleteAddress);

module.exports = router; 