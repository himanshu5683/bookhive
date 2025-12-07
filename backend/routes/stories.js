// backend/routes/stories.js - Story Sharing Routes

import express from 'express';
import Story from '../models/Story.js';
import User from '../models/User.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const router = express.Router();

/**
 * GET /api/stories
 * Fetch all stories with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
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
    
    // Build sort object
    let sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Fetch stories with pagination
    const stories = await Story.find(query)
      .populate('author', 'name email avatar')
      .populate({
        path: 'comments.author',
        select: 'name email avatar'
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await Story.countDocuments(query);
    
    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

/**
 * POST /api/stories
 * Create new story
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, category, mood } = req.body;
    const userId = req.user?.id; // Assuming user is attached by auth middleware
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Generate AI summary
    let summary = '';
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
    
    // Create new story
    const story = new Story({
      title,
      content,
      category: category || 'general',
      mood: mood || 'neutral',
      summary,
      author: userId
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
    const userId = req.user?.id;
    
    // Find story and check ownership
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.author.toString() !== userId) {
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
    const userId = req.user?.id;
    
    // Find story and check ownership
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.author.toString() !== userId) {
      return res.status(403).json({ error: 'Only the author can delete the story' });
    }
    
    // Delete story
    await story.remove();
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

/**
 * POST /api/stories/:id/like
 * Like story
 */
router.post('/:id/like', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if user already liked
    if (story.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have already liked this story' });
    }
    
    // Add like
    story.likes.push(userId);
    await story.save();
    
    res.json({ story });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Failed to like story' });
  }
});

/**
 * DELETE /api/stories/:id/like
 * Unlike story
 */
router.delete('/:id/like', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if user liked
    if (!story.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have not liked this story' });
    }
    
    // Remove like
    story.likes = story.likes.filter(id => id.toString() !== userId);
    await story.save();
    
    res.json({ story });
  } catch (error) {
    console.error('Error unliking story:', error);
    res.status(500).json({ error: 'Failed to unlike story' });
  }
});

/**
 * POST /api/stories/:id/comment
 * Add comment to story
 */
router.post('/:id/comment', async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;
    
    // Validate content
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Find story
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Add comment
    const comment = {
      content,
      author: userId
    };
    
    story.comments.push(comment);
    await story.save();
    
    // Populate author reference
    await story.populate({
      path: 'comments.author',
      select: 'name email avatar'
    });
    
    res.status(201).json({ 
      comment: story.comments[story.comments.length - 1],
      story 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;