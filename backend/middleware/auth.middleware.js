const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token and attaches user to request object
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET || 'your-secret-key-for-jwt-authentication'
    );

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired. Please log in again.'
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param  {...String} roles - Roles that are allowed to access the route
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Middleware to check if user is the owner of a resource or has admin privileges
 * @param {String} model - The model name to check ownership against
 * @param {String} paramId - The parameter name in the request params that contains the resource ID
 */
exports.isOwnerOrAdmin = (model, paramId = 'id') => {
  return async (req, res, next) => {
    try {
      // Skip check for admins
      if (req.user.role === 'admin') {
        return next();
      }

      const Model = require(`../models/${model}.model`);
      const resourceId = req.params[paramId];
      
      // Find the resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          status: 'fail',
          message: 'Resource not found'
        });
      }

      // Check if user is the owner
      const ownerId = resource.owner || resource.createdBy;
      if (!ownerId || !ownerId.equals(req.user._id)) {
        return res.status(403).json({
          status: 'fail',
          message: 'You do not have permission to perform this action'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again later.'
      });
    }
  };
};
