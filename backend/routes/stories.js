// backend/routes/stories.js - Story Sharing Routes

const express = require('express');

const router = express.Router();

// In-memory storage for development without database
const stories = [
  {
    id: 'story1',
    content: 'Just finished my ML project!',
    author: 'Alice Johnson',
    authorId: 'user1',
    likes: 284,
    comments: 42,
    shares: 18,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'story2',
    content: 'Learning React hooks today. They\'re so powerful!',
    author: 'Bob Williams',
    authorId: 'user2',
    likes: 156,
    comments: 23,
    shares: 8,
    createdAt: new Date('2024-01-14')
  }
];

/**
 * GET /api/stories
 * Fetch all stories with pagination and sorting
 * Query: ?sort=recent&page=1&limit=20
 * Response: { total, stories: [...], pagination }
 */
router.get('/', (req, res) => {
  try {
    const { sort = 'recent', page = 1, limit = 20 } = req.query;
    
    // Sort stories
    const sortedStories = [...stories].sort((a, b) => {
      if (sort === 'trending') return b.likes - a.likes;
      if (sort === 'popular') return b.comments - a.comments;
      return new Date(b.createdAt) - new Date(a.createdAt); // default to recent
    });
    
    // Paginate stories
    const skip = (page - 1) * limit;
    const paginatedStories = sortedStories.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      total: sortedStories.length,
      stories: paginatedStories,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: sortedStories.length }
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
router.post('/', (req, res) => {
  try {
    const { content, userId, author } = req.body;

    if (!content || !userId || !author) {
      return res.status(400).json({ error: 'Content, userId, and author required' });
    }

    // Create story
    const story = {
      id: 'story_' + Date.now(),
      content,
      author,
      authorId: userId,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date()
    };

    stories.push(story);

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
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    
    // Find story
    const storyIndex = stories.findIndex(story => story.id === id);
    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Update story's like count
    stories[storyIndex].likes += 1;
    
    res.status(200).json({
      message: 'Like recorded',
      likes: stories[storyIndex].likes
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
router.post('/:id/comment', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId required' });
    }

    // Find story
    const storyIndex = stories.findIndex(story => story.id === id);
    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Update story's comment count
    stories[storyIndex].comments += 1;
    
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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const storyIndex = stories.findIndex(story => story.id === id);
    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    stories.splice(storyIndex, 1);
    
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Server error deleting story' });
  }
});

module.exports = router;
