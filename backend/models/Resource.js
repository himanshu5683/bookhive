// backend/models/Resource.js - Resource Schema (Notes/PDFs)

import mongoose from 'mongoose';

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
    enum: ['note', 'pdf', 'document', 'video', 'audio']
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
  mimeType: {
    type: String
  },
  // Average rating (calculated from individual ratings)
  rating: {
    type: Number,
    default: 0
  },
  // Individual user ratings
  ratings: [{
    userId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downloads: {
    type: Number,
    default: 0
  },
  credits: {
    type: Number,
    default: 50
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumPrice: {
    type: Number,
    default: 100
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Method to calculate average rating
resourceSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.rating = 0;
    return 0;
  }
  
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.rating = Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal place
  return this.rating;
};

// Method to add/update a user rating
resourceSchema.methods.addRating = async function(userId, rating, review = '') {
  // Check if user already rated this resource
  const existingRatingIndex = this.ratings.findIndex(r => r.userId.toString() === userId.toString());
  
  if (existingRatingIndex >= 0) {
    // Update existing rating
    this.ratings[existingRatingIndex].rating = rating;
    this.ratings[existingRatingIndex].review = review;
    this.ratings[existingRatingIndex].createdAt = new Date();
  } else {
    // Add new rating
    this.ratings.push({
      userId,
      rating,
      review
    });
  }
  
  // Recalculate average rating
  this.calculateAverageRating();
  
  return await this.save();
};

export default mongoose.model('Resource', resourceSchema);