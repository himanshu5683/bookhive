// backend/db/database.js - Database Connection Scaffolds

/**
 * MongoDB Connection (Using Mongoose)
 * Install: npm install mongoose
 */
const connectMongoDB = async () => {
  const mongoose = require('mongoose');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Firebase Realtime Database Connection
 * Install: npm install firebase-admin
 */
const connectFirebase = () => {
  const admin = require('firebase-admin');
  try {
    const serviceAccount = require('../config/firebase-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('✅ Connected to Firebase');
    return admin.database();
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Firebase Firestore Connection
 * Install: npm install firebase-admin
 */
const connectFirestore = () => {
  const admin = require('firebase-admin');
  try {
    const serviceAccount = require('../config/firebase-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Connected to Firestore');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectMongoDB, connectFirebase, connectFirestore };
