// backend/db/database.js - Database Connection

import mongoose from 'mongoose';

let isConnected = false; // Track connection status

const connectDB = async () => {
  // If already connected, return without creating a new connection
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    // Use cloud MongoDB for production, local for development
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
      
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      tls: true // Explicitly enable TLS for MongoDB Atlas
    });
    
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error stack:', error.stack);
    // Don't exit in development, only in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1); // Exit in production if DB connection fails - DO NOT retry
    } else {
      throw error; // Re-throw in development for debugging
    }
  }
};

export default connectDB;