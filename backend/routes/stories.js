// backend/routes/stories.js - Story Sharing Routes

const express = require('express');
const router = express.Router();

/**
 * GET /api/stories
 * Fetch all stories with pagination and sorting
 * Query: ?sort=recent&page=1&limit=20
 * Response: { total, stories: [...], pagination }
 */
router.get('/', (req, res) => {
  const { sort = 'recent', page = 1, limit = 20 } = req.query;

  // TODO: Query database
  // TODO: Sort by (recent, trending, popular)
  // TODO: Paginate results

  res.status(200).json({
    total: 5,
    stories: [
      {
        id: 'story1',
        author: 'Alice Johnson',
        authorId: 'user1',
        content: 'Just finished my ML project!',
        timestamp: new Date(),
        likes: 284,
        comments: 42,
        shares: 18,
      },
    ],
    pagination: { page: 1, limit: 20, total: 5 },
  });
});

/**
 * POST /api/stories
 * Create a new story
 * Body: { content, userId }
 * Response: { id, ...story }
 */
router.post('/', (req, res) => {
  const { content, userId } = req.body;

  if (!content || !userId) {
    return res.status(400).json({ error: 'Content and userId required' });
  }

  // TODO: Verify authentication (JWT)
  // TODO: Validate content length
  // TODO: Save to database

  res.status(201).json({
    message: 'Story created successfully',
    story: {
      id: 'story_new',
      author: 'User Name',
      authorId: userId,
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
    },
  });
});

/**
 * POST /api/stories/:id/like
 * Like or unlike a story
 * Body: { userId }
 */
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  // TODO: Check if user already liked
  // TODO: Add/remove like from database
  // TODO: Update story's like count

  res.status(200).json({
    message: 'Like recorded',
    likes: 285,
  });
});

/**
 * POST /api/stories/:id/comment
 * Add comment to a story
 * Body: { userId, content }
 * Response: { comment: { id, userId, content, timestamp } }
 */
router.post('/:id/comment', (req, res) => {
  const { id } = req.params;
  const { userId, content } = req.body;

  // TODO: Verify authentication
  // TODO: Validate comment length
  // TODO: Save comment to database

  res.status(201).json({
    message: 'Comment added',
    comment: {
      id: 'comment_new',
      userId,
      content,
      timestamp: new Date(),
    },
  });
});

/**
 * DELETE /api/stories/:id
 * Delete a story
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // TODO: Verify ownership
  // TODO: Delete from database

  res.status(200).json({ message: 'Story deleted successfully' });
});

module.exports = router;
