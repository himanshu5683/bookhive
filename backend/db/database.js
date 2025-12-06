// backend/db/database.js - Database Connection

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use cloud MongoDB for production, local for development
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI 
      : 'mongodb://127.0.0.1:27017/bookhive';
      
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Starting server without database connection...');
    // Don't exit, allow server to start without DB for development
  }
};

module.exports = connectDB;