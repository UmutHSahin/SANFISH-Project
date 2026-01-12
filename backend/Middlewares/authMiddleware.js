const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');

/**
 * Protect middleware - JWT token verification
 * Checks if user is authenticated
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token is missing
    if (!token) {
      console.log('❌ Auth Failed: Token missing in header');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Token is missing.'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_test_secret_123');

      // Get user from token (excluding password)
      req.user = await UserModel.findById(decoded._id).select('-password_hash');

      if (!req.user) {
        console.log('❌ Auth Failed: User not found for token ID:', decoded._id);
        return res.status(401).json({
          success: false,
          message: 'User not found with this token.'
        });
      }

      // Check if user is active
      if (!req.user.is_active) {
        console.log('❌ Auth Failed: User is inactive:', req.user.email);
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated.'
        });
      }

      next();
    } catch (err) {
      console.log('❌ Auth Failed: Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication.',
      error: error.message
    });
  }
};

/**
 * Authorize middleware - Role-based access control
 * Checks if user has required role(s)
 * @param {...string} roles - Allowed roles (admin, partner, developer)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};

