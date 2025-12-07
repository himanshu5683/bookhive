// backend/server.js - Main Express Server Entry Point

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const path = require('path');
const connectDB = require('./db/database');
require('dotenv').config();

// Database connection
connectDB();

// Passport configuration
require('./config/passport');

const app = express();
const server = http.createServer(app);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'bookhive_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies (HTTPS)
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'none', // Allow cross-site requests
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3000/bookhive",
  "https://himanshu5683.github.io",
  "https://himanshu5683.github.io/bookhive",
  ...(process.env.REACT_APP_URL ? process.env.REACT_APP_URL.split(',') : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.PRODUCTION_URL ? [process.env.PRODUCTION_URL] : [])
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Also allow origins that start with our allowed origins (to handle subpaths)
    for (const allowedOrigin of allowedOrigins) {
      if (origin.startsWith(allowedOrigin)) {
        return callback(null, true);
      }
    }
    
    // For production, be more permissive with subdomains
    if (process.env.NODE_ENV === 'production' && origin && origin.includes('github.io')) {
      return callback(null, true);
    }
    
    // Block the request if the origin is not allowed
    console.log("Blocked by CORS: " + origin);
    console.log("Allowed origins: ", allowedOrigins);
    return callback(new Error("Blocked by CORS: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Add CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/oauth', require('./routes/oauth')); // OAuth routes
app.use('/api/resources', require('./routes/resources'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/circles', require('./routes/circles'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/events', require('./routes/events'));
app.use('/api/twofactor', require('./routes/twoFactor'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'BookHive Backend is running successfully'
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ reply: "Server crashed internally." });
});

// Make WebSocket service available to routes
const WebSocketService = require('./services/websocket');
const wsService = new WebSocketService(server);
app.set('wsService', wsService);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 BookHive Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation at http://localhost:${PORT}/api`);
  console.log(`🔔 Notifications system available at http://localhost:${PORT}/api/notifications`);
  console.log(`🏆 Achievements system available at http://localhost:${PORT}/api/achievements`);
  console.log(`📅 Events system available at http://localhost:${PORT}/api/events`);
  console.log(`🤖 AI Features available at http://localhost:${PORT}/api/ai`);
  console.log(`🔐 2FA system available at http://localhost:${PORT}/api/twofactor`);
  console.log(`📡 WebSocket server available at ws://localhost:${PORT}`);
  console.log(`🔑 OAuth endpoints available at http://localhost:${PORT}/api/oauth`);
});