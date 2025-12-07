// backend/models/Event.js - Event Schema for Live Events/Webinars

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true,
    trim: true
  },
  hostId: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    userId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    trim: true
  },
  recordingLink: {
    type: String,
    trim: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ hostId: 1 });
eventSchema.index({ category: 1 });

export default mongoose.model('Event', eventSchema);