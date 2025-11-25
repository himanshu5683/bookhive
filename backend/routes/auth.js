// backend/routes/auth.js - Authentication Routes

const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 * Body: { email, password, name }
 * Response: { token, user: { id, name, email, credits } }
 */
router.post('/signup', (req, res) => {
  const { email, password, name } = req.body;
  
  // TODO: Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // TODO: Hash password with bcryptjs
  // const hashedPassword = await bcrypt.hash(password, 10);

  // TODO: Save to database
  // const user = await User.create({ email, password: hashedPassword, name });

  // TODO: Generate JWT token
  // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.status(201).json({
    message: 'User created successfully',
    token: 'placeholder_token',
    user: { id: 'user_id', name, email, credits: 0 },
  });
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 * Body: { email, password }
 * Response: { token, user: { id, name, email, credits } }
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // TODO: Find user by email
  // const user = await User.findOne({ email });
  // if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // TODO: Verify password
  // const validPassword = await bcrypt.compare(password, user.password);
  // if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

  // TODO: Generate JWT token
  // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.status(200).json({
    message: 'Login successful',
    token: 'placeholder_token',
    user: { id: 'user_id', name: 'User Name', email, credits: 100 },
  });
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
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // TODO: Verify token with JWT
  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //   res.status(200).json({ valid: true, userId: decoded.userId });
  // } catch (err) {
  //   res.status(401).json({ valid: false, error: 'Invalid token' });
  // }

  res.status(200).json({ valid: true, userId: 'user_id' });
});

module.exports = router;
