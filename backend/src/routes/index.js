const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const productRoute = require('./product.route');
const categoryRoute = require('./category.route');
const reviewRoute = require('./review.route');
const pictureRoute = require('./picture.route');
const uploadRoute = require('./upload');
const docsRoute = require('./docs.route');
const config = require('../config/config');
const wishlistRoute = require('./wishlist.route');
const orderRoute = require('./order.route');
const dashboardRoute = require('./dashboard.route');
const goongRoute = require('./goong.route');
const locationRoute = require('./location.route');
const momoRoute = require('./momo.route');
const cartRoute = require('./cart.route');
const adminRoute = require('./admin.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
  {
    path: '/category',
    route: categoryRoute,
  },
  {
    path: '/location',
    route: locationRoute,
  },
  {
    path: '/review',
    route: reviewRoute,
  },
  {
    path: '/picture',
    route: pictureRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
  {
    path: '/wishlist',
    route: wishlistRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/goong',
    route: goongRoute,
  },
  {
    path: '/momo',
    route: momoRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
