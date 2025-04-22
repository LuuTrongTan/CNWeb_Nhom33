const passport = require('passport');
const { validationResult } = require('express-validator');

// JWT authentication middleware
exports.authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid or expired token'
      });
    }
    
    req.user = user;
    return next();
  })(req, res, next);
};

// Validation handler middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; 