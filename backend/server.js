// backend/server.js - Main Express Server Entry Point

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import http from 'http';
import path from 'path';
import connectDB from './db/database.js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

// Log environment for debugging
console.log('=== ENVIRONMENT DEBUG INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('==============================');

// Database connection with better error handling
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('✅ Database connection established');
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error.message);
  console.error('Error stack:', error.stack);
  // In production, we might want to exit, but let's try to continue for debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('Exiting due to database connection failure in production');
    process.exit(1);
  }
});

// Passport configuration
import './config/passport.js';

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your_session_secret_key_here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Adjust for production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://himanshu5683.github.io",
  "https://himanshu5683.github.io/bookhive"
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
    
    // Log the blocked origin for debugging
    console.log("Blocked by CORS: " + origin);
    console.log("Allowed origins: ", allowedOrigins);
    return callback(new Error("Blocked by CORS: " + origin), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false // Important: set to false to let express handle preflight
};

// Apply CORS middleware BEFORE any routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Import API routes
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import resourcesRoutes from './routes/resources.js';
import storiesRoutes from './routes/stories.js';
import circlesRoutes from './routes/circles.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import activityRoutes from './routes/activity.js';
import requestsRoutes from './routes/requests.js';
import feedbackRoutes from './routes/feedback.js';
import notificationsRoutes from './routes/notifications.js';
import achievementsRoutes from './routes/achievements.js';
import eventsRoutes from './routes/events.js';
import twoFactorRoutes from './routes/twoFactor.js';

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes); // OAuth routes
app.use('/api/resources', resourcesRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/circles', circlesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/twofactor', twoFactorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'ok', 
    db: dbStatus,
    timestamp: new Date().toISOString(),
    message: 'BookHive Backend is running successfully'
  });
});

// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'BookHive Backend is running',
    timestamp: new Date().toISOString(),
    dbConnected: dbConnected
  });
});

// Error logging middleware
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  // Don't expose sensitive error information in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: "Internal server error" });
  } else {
    res.status(500).json({ error: err.message });
  }
});

// Make WebSocket service available to routes
import WebSocketService from './services/websocket.js';
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

// Wrap server startup in try-catch for better error handling
try {
  server.listen(PORT, () => {
    console.log(`🚀 BookHive Backend running on port ${PORT}`);
    console.log(`📚 API available at /api`);
    console.log(`🔄 Deployment timestamp: ${new Date().toISOString()}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}