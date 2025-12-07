// backend/models/Feedback.js - User Feedback Schema

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bug', 'feature', 'improvement', 'other'],
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Feedback', feedbackSchema);