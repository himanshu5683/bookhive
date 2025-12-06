// backend/models/Activity.js - Activity Logging Model

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'login', 
      'logout', 
      'signup',
      'upload',
      'download',
      'rating',
      'review',
      'story',
      'circle_join',
      'circle_leave',
      'circle_post',
      'request_create',
      'request_fulfill',
      'follow',
      'unfollow',
      'achievement_unlocked',
      'profile_update',
      'resource_update',
      'resource_delete'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  creditsBefore: {
    type: Number,
    default: 0
  },
  creditsAfter: {
    type: Number,
    default: 0
  },
  creditsChange: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);