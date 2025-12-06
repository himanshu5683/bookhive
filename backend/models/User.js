// backend/models/User.js - User Schema

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only for email/password accounts
      return !this.oauthId;
    },
    minlength: 6
  },
  credits: {
    type: Number,
    default: 0
  },
  contributions: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  badges: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  // OAuth fields
  provider: {
    type: String,
    enum: ['local', 'google', 'github', 'facebook', 'twitter'],
    default: 'local'
  },
  oauthId: {
    type: String
  },
  // 2FA fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  twoFactorRecoveryCodes: [{
    type: String
  }],
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's being set and user is not using OAuth
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If user doesn't have a password (OAuth user), reject
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Update user tags based on activity
userSchema.methods.updateTags = async function(newTags) {
  // Merge new tags with existing tags and remove duplicates
  const mergedTags = [...new Set([...this.tags, ...newTags])];
  
  // Limit to 20 tags max
  this.tags = mergedTags.slice(0, 20);
  
  return await this.save();
};

// Generate 2FA secret
userSchema.methods.generateTwoFactorSecret = function() {
  const speakeasy = require('speakeasy');
  const secret = speakeasy.generateSecret({
    name: `BookHive (${this.email})`,
    issuer: 'BookHive'
  });
  
  this.twoFactorSecret = secret.base32;
  return secret;
};

// Verify 2FA token
userSchema.methods.verifyTwoFactorToken = function(token) {
  const speakeasy = require('speakeasy');
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Generate recovery codes
userSchema.methods.generateRecoveryCodes = function(count = 10) {
  const crypto = require('crypto');
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex');
    codes.push(code);
  }
  
  this.twoFactorRecoveryCodes = codes;
  return codes;
};

// Verify recovery code
userSchema.methods.verifyRecoveryCode = function(code) {
  const index = this.twoFactorRecoveryCodes.indexOf(code);
  if (index !== -1) {
    // Remove the used code
    this.twoFactorRecoveryCodes.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);