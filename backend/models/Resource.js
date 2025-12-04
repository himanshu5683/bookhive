// backend/models/Resource.js - Resource Schema (Notes/PDFs)

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['note', 'pdf']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  authorId: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  },
  filePath: {
    type: String
  },
  fileSize: {
    type: Number
  },
  rating: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  credits: {
    type: Number,
    default: 100
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);