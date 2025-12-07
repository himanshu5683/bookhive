// backend/models/StudyCircle.js - Study Circle Schema

import mongoose from 'mongoose';

const studyCircleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    userId: String,
    joinedAt: Date
  }],
  threads: [{
    title: String,
    content: String,
    authorId: String,
    createdAt: Date
  }],
  createdBy: {
    type: String,
    required: true
  },
  memberCount: {
    type: Number,
    default: 1
  },
  threadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('StudyCircle', studyCircleSchema);