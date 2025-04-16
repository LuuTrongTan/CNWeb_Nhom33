const express = require('express');
const { check } = require('express-validator');
const wishlistController = require('../controllers/wishlist.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticateJWT);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post(
  '/',
  [
    check('productId', 'Product ID is required').not().isEmpty()
  ],
  wishlistController.addToWishlist
);

// Remove product from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router; 