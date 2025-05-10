const userService = require('./user.service');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const authService = require('./auth.service');
const productService = require('./product.service');
const categoryService = require('./category.service');
const reviewService = require('./review.service');
const pictureService = require('./picture.service');
const wishlistService = require('./wishlist.service');
const orderService = require('./order.service');
const cartService = require('./cart.service');

module.exports = {
  userService,
  tokenService,
  emailService,
  authService,
  productService,
  categoryService,
  reviewService,
  pictureService,
  wishlistService,
  orderService,
  cartService,
};

module.exports.authService = require('./auth.service');
module.exports.emailService = require('./email.service');
module.exports.tokenService = require('./token.service');
module.exports.userService = require('./user.service');
module.exports.productService = require('./product.service');
module.exports.categoryService = require('./category.service');
module.exports.orderService = require('./order.service');
