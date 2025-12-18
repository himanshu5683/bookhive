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
// Import API routes at the top level
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
// Import WebSocket service at the top level
// import WebSocketService from './services/websocket.js';
import { WebSocketServer } from 'ws';
// Passport configuration
import './config/passport.js';

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

dotenv.config();

// Database connection - wrap in async IIFE to handle errors better
(async () => {
  try {
    // Only attempt database connection if MONGODB_URI is provided
    if (process.env.MONGODB_URI) {
      await connectDB();
      console.log('✅ Database connection established');
    } else {
      console.log('⚠️ No MongoDB URI provided, skipping database connection');
    }
    startServer();
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    // Don't exit the process, start the server anyway to allow health checks
    console.log('⚠️ Starting server without database connection for health checks');
    startServer();
  }
})();

// Function to start the server after database connection
function startServer() {
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
    secret: process.env.SESSION_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGODB_URI ? MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 24 hours
    }) : undefined,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // CORS configuration
  const corsOptions = {
    origin: ['https://himanshu5683.github.io'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  };

  // Apply CORS middleware BEFORE any routes
  app.use(cors(corsOptions));

  // Handle preflight requests
  app.options("*", cors());

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });

  // Routes
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

  // Health check endpoint - Works even without database connection
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
      timestamp: new Date().toISOString()
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

  // Attach WebSocket server
  const wss = new WebSocketServer({ server, path: "/ws" });
  
  wss.on("connection", (ws, req) => {
    console.log("WS client connected");
    
    // Add authentication flag
    ws.isAuthenticated = false;
    ws.userId = null;
    
    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        
        // Handle authentication
        if (data.type === 'authenticate') {
          // Prevent multiple auth attempts
          if (ws.isAuthenticated) {
            console.log("WS client already authenticated, ignoring duplicate auth request");
            return;
          }
          
          if (data.userId) {
            ws.isAuthenticated = true;
            ws.userId = data.userId;
            console.log(`WS client authenticated for user ${data.userId}`);
            
            // Send confirmation back to client
            ws.send(JSON.stringify({
              type: 'authenticated',
              message: 'Successfully authenticated'
            }));
          } else {
            console.log("WS authentication failed: missing userId");
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Authentication failed: missing userId'
            }));
          }
          return;
        }
        
        // Require authentication for all other messages
        if (!ws.isAuthenticated) {
          console.log("WS message rejected: client not authenticated");
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Authentication required'
          }));
          return;
        }
        
        // Handle other message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          case 'subscribe':
            // Handle subscription logic here if needed
            console.log(`WS client ${ws.userId} subscribed to ${data.channel}`);
            break;
          case 'unsubscribe':
            // Handle unsubscription logic here if needed
            console.log(`WS client ${ws.userId} unsubscribed from ${data.channel}`);
            break;
          default:
            console.log("WS unknown message type:", data.type);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            }));
        }
      } catch (error) {
        console.error("WS message processing error:", error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Message processing error'
        }));
      }
    });
    
    ws.on("close", () => {
      console.log("WS client disconnected", ws.userId ? `for user ${ws.userId}` : '');
    });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
    process.exit(0);
  });

  // Use Railway's PORT or default to 8080
  const PORT = process.env.PORT || 8080;

  // Start the server
  server.listen(PORT, () => {
    console.log(`🚀 BookHive Backend running on port ${PORT}`);
    console.log(`📚 API available at /api`);
    console.log(`🔄 Deployment timestamp: ${new Date().toISOString()}`);
  });
}