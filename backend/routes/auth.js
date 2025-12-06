// backend/routes/auth.js - Authentication Routes

const express = require('express');
const jwt = require('jsonwebtoken');
// bcrypt is used in the User model for password hashing
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { email, password, name }
 * Response: { token, user: { id, name, email, credits } }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
    res.status(500).json({ error: 'Server error during signup' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 * Body: { email, password }
 * Response: { token, user: { id, name, email, credits } }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

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
    res.status(500).json({ error: 'Server error during login' });
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
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

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
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
