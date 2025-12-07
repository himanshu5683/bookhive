// backend/models/Achievement.js - Achievement Schema

import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['upload', 'download', 'rating', 'review', 'contribution', 'social', 'milestone']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String, // Emoji or icon identifier
    default: '🏆'
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  criteria: {
    type: Object // Criteria for earning this achievement
  }
}, {
  timestamps: true
});

// Index for efficient querying
achievementSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Achievement', achievementSchema);