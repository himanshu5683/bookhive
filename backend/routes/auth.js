// backend/routes/auth.js - Authentication Routes

import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
// bcrypt is used in the User model for password hashing
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { email, password, name }
 * Response: { token, user: { id, name, email, credits } }
 */
router.post('/signup', 
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, name } = req.body;
    
    console.log('Signup attempt for email:', email);

    // Validate input
    if (!email || !password || !name) {
      console.log('Missing required fields for signup');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    console.log('Signup successful for user:', email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup: ' + error.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 * Body: { email, password, twoFactorToken }
 * Response: { token, user: { id, name, email, credits }, requires2FA }
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, twoFactorToken } = req.body;

    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // If 2FA token is not provided, request it
      if (!twoFactorToken) {
        console.log('2FA required for user:', email);
        return res.status(200).json({ 
          requires2FA: true,
          message: '2FA required'
        });
      }
      
      // Verify 2FA token
      const isValid2FA = user.verifyTwoFactorToken(twoFactorToken);
      if (!isValid2FA) {
        console.log('Invalid 2FA token for user:', email);
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    console.log('Login successful for user:', email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login: ' + error.message });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate token on client)
 */
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/verify
 * Verify JWT token validity
 * Headers: { Authorization: 'Bearer token' }
 */
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('Token verification attempt');

    if (!token) {
      console.log('No token provided for verification');
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('Invalid token - user not found');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Token verification successful for user:', user.email);

    res.status(200).json({
      valid: true,
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(401).json({ valid: false, error: 'Invalid token: ' + err.message });
  }
});

export default router;