const express = require('express');
const auth = require('../middlewares/auth');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router
  .route('/')
  .get(auth(), wishlistController.getMyWishlist)
  .post(auth(), wishlistController.addToWishlist);

router
  .route('/:productId')
  .delete(auth(), wishlistController.removeFromWishlist)
  .get(auth(), wishlistController.checkProductInWishlist);

module.exports = router; 