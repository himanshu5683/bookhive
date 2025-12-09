// backend/db/database.js - Database Connection

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use cloud MongoDB for production, local for development
    const mongoURI = process.env.MONGODB_URI;
      
    const conn = await mongoose.connect(mongoURI, {
      tls: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      minPoolSize: 1,
      maxPoolSize: 10,
      retryWrites: true
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit in production if DB connection fails
  }
};

export default connectDB;