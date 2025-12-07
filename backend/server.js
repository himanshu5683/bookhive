// server.js - BookHive Backend Server

const express = require('express');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Database connection
const connectDB = require('./db/database');
connectDB();

// Passport configuration
require('./config/passport');

const app = express();
const server = http.createServer(app);

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'bookhive_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://himanshu5683.github.io",
    "https://himanshu5683.github.io/bookhive"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

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

// Start server
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