// backend/middleware/auth.js - Authentication Middleware

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // If no token in header, check cookies
    if (!token && req.cookies) {
      token = req.cookies.token || req.cookies.jwt;
    }
    
    // Check if token exists
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Log the token for debugging (don't log in production)
    console.log('Received token for verification');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT payload:', decoded);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');
    
    // Check if user exists
    if (!user) {
      console.log('User not found for decoded userId:', decoded.userId);
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }
    
    // Attach user to request object
    req.user = user;
    
    // Ensure req.user.id is available for compatibility
    req.user.id = user._id;
    
    // Log authenticated user for debugging
    console.log(`User authenticated: ${user._id} (${user.name})`);
    console.log('req.user object:', req.user);
    
    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    console.error('Full error details:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

export default authenticate;