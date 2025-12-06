// backend/routes/stories.js - Story Sharing Routes

const express = require('express');
const Story = require('../models/Story');

const router = express.Router();

/**
 * GET /api/stories
 * Fetch all stories with pagination and sorting
 * Query: ?sort=recent&page=1&limit=20
 * Response: { total, stories: [...], pagination }
 */
router.get('/', async (req, res) => {
  try {
    const { sort = 'recent', page = 1, limit = 20 } = req.query;
    
    // Build sort
    const sortObj = {};
    if (sort === 'trending') sortObj.likes = -1;
    else if (sort === 'popular') sortObj.comments = -1;
    else sortObj.createdAt = -1; // default to recent
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await Story.countDocuments();
    const stories = await Story.find()
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      stories,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Server error fetching stories' });
  }
});

/**
 * POST /api/stories
 * Create a new story
 * Body: { content, userId, author }
 * Response: { id, ...story }
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, userId, author } = req.body;

    if (!content || !userId || !author) {
      return res.status(400).json({ error: 'Content, userId, and author required' });
    }

    // Create story
    const story = new Story({
      title: title || 'Untitled',
      content,
      author,
      authorId: userId
    });

    await story.save();

    res.status(201).json({
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Server error creating story' });
  }
});

/**
 * POST /api/stories/:id/like
 * Like or unlike a story
 * Body: { userId }
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find story
    const story = await Story.findByIdAndUpdate(id, {
      $inc: { likes: 1 }
    }, { new: true });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.status(200).json({
      message: 'Like recorded',
      likes: story.likes
    });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Server error liking story' });
  }
});

/**
 * POST /api/stories/:id/comment
 * Add comment to a story
 * Body: { userId, content }
 * Response: { comment: { id, userId, content, timestamp } }
 */
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId required' });
    }

    // Find story
    const story = await Story.findByIdAndUpdate(id, {
      $inc: { comments: 1 }
    }, { new: true });
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.status(201).json({
      message: 'Comment added',
      comment: {
        id: 'comment_' + Date.now(),
        userId,
        content,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete a story
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await Story.findByIdAndDelete(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Server error deleting story' });
  }
});

module.exports = router;
