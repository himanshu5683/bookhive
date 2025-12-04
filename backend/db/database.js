// backend/db/database.js - Database Connection

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Starting server without database connection...');
    // Don't exit, allow server to start without DB for development
  }
};

module.exports = connectDB;
