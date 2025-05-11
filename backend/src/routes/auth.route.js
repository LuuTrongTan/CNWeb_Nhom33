const express = require('express');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
/*router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);*/

router.post('/forgot-password', userController.requestPasswordReset);
router.post('/verify-reset-code', userController.verifyResetCode);
router.post('/reset-password', userController.resetPassword);
/*router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);*/
router.post('/google-login', validate(authValidation.googleLoginSchema) ,authController.googleAuth);

router.post('/change-password', auth(), validate(authValidation.changePassword), userController.changePassword);

// Thêm route mới cho xác thực email
router.post('/request-email-verification', auth(), userController.requestEmailVerification);
router.post('/verify-email', auth(), userController.verifyEmail);

module.exports = router;
