// backend/models/Notification.js - Notification Schema

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['resource', 'circle', 'request', 'system', 'achievement']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String // ID of related resource, circle, request, etc.
  },
  relatedType: {
    type: String,
    enum: ['resource', 'circle', 'request', 'user']
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);