// backend/routes/stories.js - Story Sharing Routes

import express from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story.js';
import User from '../models/User.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import authenticate from '../middleware/auth.js';

dotenv.config();

// Initialize OpenAI client
let openai = null;

// Only initialize if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const router = express.Router();

// Apply authentication middleware only to routes that need it
// Public routes (no authentication needed)
// Private routes (authentication required)
router.use((req, res, next) => {
  // Only apply authentication to routes that modify data
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    return authenticate(req, res, next);
  }
  // For GET requests, proceed without authentication
  next();
});

/**
 * GET /api/stories
 * Fetch all stories with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = -1, sort } = req.query;
    
    // Build query
    let query = {};
    
    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Build sort object - handle both old and new sort parameter formats
    let sortObj = {};
    if (sort) {
      // New format: sort can be 'rating', '-rating', 'createdAt', '-createdAt', etc.
      if (sort.startsWith('-')) {
        sortObj[sort.substring(1)] = -1;
      } else {
        sortObj[sort] = 1;
      }
    } else {
      // Old format: sortBy and sortOrder
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    // Fetch stories with pagination
    const stories = await Story.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Initialize and sanitize likes and comments arrays in all stories to prevent validation errors
    stories.forEach(story => {
      // Initialize likes array if undefined
      if (!story.likes) {
        story.likes = [];
      }
      // Validate and sanitize likes array
      if (!Array.isArray(story.likes)) {
        story.likes = [];
      }
      // Filter out any invalid ObjectId values from likes
      if (Array.isArray(story.likes)) {
        story.likes = story.likes.filter(like => {
          try {
            return mongoose.Types.ObjectId.isValid(like);
          } catch (e) {
            return false;
          }
        });
      }
      
      // Initialize comments array if undefined
      if (!story.comments) {
        story.comments = [];
      }
      // Validate and sanitize comments array
      if (!Array.isArray(story.comments)) {
        story.comments = [];
      }
      // Filter out any invalid comment objects from comments
      if (Array.isArray(story.comments)) {
        story.comments = story.comments.filter(comment => {
          try {
            // Check if comment is a valid object with required properties
            return comment && typeof comment === 'object' && (comment.user || comment.text);
          } catch (e) {
            return false;
          }
        });
      }
    });
    
    // Get total count
    const total = await Story.countDocuments(query);
    
    res.json({
      stories: stories || [],
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    // Always return a safe response even if there's an error
    res.status(200).json({
      stories: [],
      totalPages: 0,
      currentPage: 1,
      total: 0
    });
  }
});

/**
 * POST /api/stories
 * Create new story
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, category, mood } = req.body;
    const userId = req.user.id; // Using id from authenticated user
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Generate AI summary only if OpenAI is available
    let summary = '';
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a story summarizer. Create a brief, engaging summary of the story."
            },
            {
              role: "user",
              content: `Summarize this story in one sentence:\n\n${content.substring(0, 1000)}`
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        });
        
        summary = completion.choices[0].message.content.trim();
      } catch (aiError) {
        console.warn('Failed to generate AI summary:', aiError.message);
        // Use first sentence as fallback
        summary = content.split('.')[0] + '.';
      }
    } else {
      // Use first sentence as fallback when OpenAI is not configured
      summary = content.split('.')[0] + '.';
    }
    
    // Create new story
    const story = new Story({
      title,
      content,
      category: category || 'general',
      mood: mood || 'neutral',
      summary,
      author: req.user.name, // Using name from authenticated user
      authorId: userId.toString() // Store user ID as string
    });
    
    await story.save();
    
    // Populate author reference
    await story.populate('author', 'name email');
    
    res.status(201).json({ story });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

/**
 * PUT /api/stories/:id
 * Update story
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, mood } = req.body;
    const userId = req.user.id; // Using id from authenticated user
    
    // Find story and check ownership
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Initialize likes array if undefined
    if (!story.likes) {
      story.likes = [];
    }
    // Validate and sanitize likes array to prevent validation errors
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }
    // Filter out any invalid ObjectId values from likes
    if (Array.isArray(story.likes)) {
      story.likes = story.likes.filter(like => {
        try {
          return mongoose.Types.ObjectId.isValid(like);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Initialize comments array if undefined
    if (!story.comments) {
      story.comments = [];
    }
    // Validate and sanitize comments array to prevent validation errors
    if (!Array.isArray(story.comments)) {
      story.comments = [];
    }
    // Filter out any invalid comment objects from comments
    if (Array.isArray(story.comments)) {
      story.comments = story.comments.filter(comment => {
        try {
          // Check if comment is a valid object with required properties
          return comment && typeof comment === 'object' && (comment.user || comment.text);
        } catch (e) {
          return false;
        }
      });
    }
    
    if (story.authorId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the author can update the story' });
    }
    
    // Update fields
    if (title) story.title = title;
    if (content) story.content = content;
    if (category) story.category = category;
    if (mood) story.mood = mood;
    
    await story.save();
    
    res.json({ story });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete story
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user
    
    // Check if story exists
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Initialize likes array if undefined
    if (!story.likes) {
      story.likes = [];
    }
    // Validate and sanitize likes array to prevent validation errors
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }
    // Filter out any invalid ObjectId values from likes
    if (Array.isArray(story.likes)) {
      story.likes = story.likes.filter(like => {
        try {
          return mongoose.Types.ObjectId.isValid(like);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Initialize comments array if undefined
    if (!story.comments) {
      story.comments = [];
    }
    // Validate and sanitize comments array to prevent validation errors
    if (!Array.isArray(story.comments)) {
      story.comments = [];
    }
    // Filter out any invalid comment objects from comments
    if (Array.isArray(story.comments)) {
      story.comments = story.comments.filter(comment => {
        try {
          // Check if comment is a valid object with required properties
          return comment && typeof comment === 'object' && (comment.user || comment.text);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Check if user is authorized to delete the story
    if (story.authorId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the author can delete the story' });
    }
    
    // Delete story using deleteOne() instead of remove() to avoid deprecation warning
    await Story.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    // Return appropriate error status
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

/**
 * POST /api/stories/:id/like
 * Like/unlike a story
 */
router.post('/:id/like', async (req, res) => {
  try {
    console.log('Like route called with user:', req.user);
    // Validate user - req.user comes from authentication middleware
    if (!req.user || !req.user.id) {
      console.log('Authentication failed in like route - req.user:', req.user);
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.id; // Get user ID from authenticated user
    console.log('User ID extracted:', userId);
    
    // Validate story ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid story ID' });
    }
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    // Initialize likes array if undefined
    if (!story.likes) {
      story.likes = [];
    }
    // Validate and sanitize likes array to prevent validation errors
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }
    // Filter out any invalid ObjectId values from likes
    if (Array.isArray(story.likes)) {
      story.likes = story.likes.filter(like => {
        try {
          return mongoose.Types.ObjectId.isValid(like);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Initialize comments array if undefined
    if (!story.comments) {
      story.comments = [];
    }
    // Validate and sanitize comments array to prevent validation errors
    if (!Array.isArray(story.comments)) {
      story.comments = [];
    }
    // Filter out any invalid comment objects from comments
    if (Array.isArray(story.comments)) {
      story.comments = story.comments.filter(comment => {
        try {
          // Check if comment is a valid object with required properties
          return comment && typeof comment === 'object' && (comment.user || comment.text);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Check if user has already liked the story
    const hasLiked = story.likes.some(like => like.toString() === userId.toString());
    
    if (hasLiked) {
      // Remove like: filter out the specific user ID
      story.likes = story.likes.filter(like => like.toString() !== userId.toString());
    } else {
      // Add like: push the user ID if not already present
      story.likes.push(userId);
    }
    
    await story.save();
    
    // Check if currently liked (after toggle)
    const isLiked = !hasLiked;
    
    res.status(200).json({ 
      success: true,
      message: isLiked ? 'Story liked successfully' : 'Story unliked successfully',
      likesCount: story.likes.length,
      liked: isLiked
    });
  } catch (error) {
    console.error('Error liking story:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to like story', details: error.message });
  }
});

/**
 * POST /api/stories/:id/comment
 * Add a comment to a story
 */
router.post('/:id/comment', async (req, res) => {
  try {
    const { content } = req.body;
    console.log('Comment route called with user:', req.user);
    
    // Validate user - req.user comes from authentication middleware
    if (!req.user || !req.user.id) {
      console.log('Authentication failed in comment route - req.user:', req.user);
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.id; // Get user ID from authenticated user
    console.log('User ID extracted:', userId);
    
    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Comment content is required' });
    }
    
    // Validate story ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid story ID' });
    }
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    // Initialize likes array if undefined
    if (!story.likes) {
      story.likes = [];
    }
    // Validate and sanitize likes array to prevent validation errors
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }
    // Filter out any invalid ObjectId values from likes
    if (Array.isArray(story.likes)) {
      story.likes = story.likes.filter(like => {
        try {
          return mongoose.Types.ObjectId.isValid(like);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Initialize comments array if undefined
    if (!story.comments) {
      story.comments = [];
    }
    // Validate and sanitize comments array to prevent validation errors
    if (!Array.isArray(story.comments)) {
      story.comments = [];
    }
    // Filter out any invalid comment objects from comments
    if (Array.isArray(story.comments)) {
      story.comments = story.comments.filter(comment => {
        try {
          // Check if comment is a valid object with required properties
          return comment && typeof comment === 'object' && (comment.user || comment.text);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Ensure comments array exists
    if (!story.comments) {
      story.comments = [];
    }
    
    // Add comment - ensure we're using the ObjectId for the user
    const comment = {
      user: userId,
      text: content.trim(),
      createdAt: new Date()
    };
    
    story.comments.push(comment);
    
    await story.save();
    
    // Populate user reference for response
    await story.populate({ path: 'comments.user', select: 'name' });
    
    // Get the newly added comment (should be the last one)
    const newComment = story.comments[story.comments.length - 1];
    
    res.status(201).json({ 
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to add comment', details: error.message });
  }
});

/**
 * POST /api/stories/:id/share
 * Share a story (increment share count)
 */
router.post('/:id/share', async (req, res) => {
  try {
    console.log('Share route called with user:', req.user);
    // Validate user - req.user comes from authentication middleware
    if (!req.user || !req.user.id) {
      console.log('Authentication failed in share route - req.user:', req.user);
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = req.user.id; // Get user ID from authenticated user
    console.log('User ID extracted:', userId);
    
    // Validate story ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid story ID' });
    }
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    // Initialize likes array if undefined
    if (!story.likes) {
      story.likes = [];
    }
    // Validate and sanitize likes array to prevent validation errors
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }
    // Filter out any invalid ObjectId values from likes
    if (Array.isArray(story.likes)) {
      story.likes = story.likes.filter(like => {
        try {
          return mongoose.Types.ObjectId.isValid(like);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Initialize comments array if undefined
    if (!story.comments) {
      story.comments = [];
    }
    // Validate and sanitize comments array to prevent validation errors
    if (!Array.isArray(story.comments)) {
      story.comments = [];
    }
    // Filter out any invalid comment objects from comments
    if (Array.isArray(story.comments)) {
      story.comments = story.comments.filter(comment => {
        try {
          // Check if comment is a valid object with required properties
          return comment && typeof comment === 'object' && (comment.user || comment.text);
        } catch (e) {
          return false;
        }
      });
    }
    
    // Ensure shareCount is initialized
    if (typeof story.shareCount !== 'number') {
      story.shareCount = 0;
    }
    
    // Increment share count
    story.shareCount = story.shareCount + 1;
    
    await story.save();
    
    // Generate shareable URL
    const shareableUrl = `${process.env.FRONTEND_URL || 'https://himanshu5683.github.io/bookhive'}/stories/${story._id}`;
    
    res.status(200).json({ 
      success: true,
      message: 'Story shared successfully',
      shareCount: story.shareCount,
      shareableUrl: shareableUrl
    });
  } catch (error) {
    console.error('Error sharing story:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Failed to share story', details: error.message });
  }
});

export default router;