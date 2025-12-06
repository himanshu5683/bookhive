// backend/models/ResourceRequest.js - Resource Request Schema

const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  requesterId: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  resolverId: {
    type: String
  },
  resolverName: {
    type: String,
    trim: true
  },
  fulfilledAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);