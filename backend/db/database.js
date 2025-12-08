// backend/db/database.js - Database Connection

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use cloud MongoDB for production, local for development
    const mongoURI = process.env.MONGODB_URI;
      
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit in production if DB connection fails
  }
};

export default connectDB;