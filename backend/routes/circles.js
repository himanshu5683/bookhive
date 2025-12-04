// backend/routes/circles.js - Study Circles Routes

const express = require('express');

const router = express.Router();

// In-memory storage for development without database
const circles = [
  {
    id: 'circle1',
    name: 'Advanced JavaScript Study Group',
    topic: 'Programming',
    description: 'Deep dive into modern JavaScript',
    createdBy: 'user1',
    members: [
      { userId: 'user1', joinedAt: new Date('2024-01-01') },
      { userId: 'user2', joinedAt: new Date('2024-01-05') }
    ],
    threads: [
      {
        id: 'thread1',
        title: 'Best practices for React hooks',
        content: 'What are your favorite React hook patterns?',
        authorId: 'user1',
        createdAt: new Date('2024-01-10')
      }
    ],
    memberCount: 2,
    threadCount: 1,
    createdAt: new Date('2024-01-01')
  }
];

/**
 * GET /api/circles
 * Fetch all study circles
 * Query: ?topic=Programming&page=1&limit=10
 */
router.get('/', (req, res) => {
  try {
    const { topic, page = 1, limit = 10 } = req.query;
    
    // Filter circles
    let filteredCircles = [...circles];
    if (topic) {
      filteredCircles = filteredCircles.filter(circle => circle.topic === topic);
    }
    
    // Paginate circles
    const skip = (page - 1) * limit;
    const paginatedCircles = filteredCircles.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      total: filteredCircles.length,
      circles: paginatedCircles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: filteredCircles.length }
    });
  } catch (error) {
    console.error('Error fetching circles:', error);
    res.status(500).json({ error: 'Server error fetching circles' });
  }
});

/**
 * POST /api/circles
 * Create a new study circle
 * Body: { name, topic, description, creatorId }
 */
router.post('/', (req, res) => {
  try {
    const { name, topic, description, creatorId } = req.body;

    if (!name || !topic || !creatorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create circle
    const circle = {
      id: 'circle_' + Date.now(),
      name,
      topic,
      description,
      createdBy: creatorId,
      members: [{ userId: creatorId, joinedAt: new Date() }],
      threads: [],
      memberCount: 1,
      threadCount: 0,
      createdAt: new Date()
    };

    circles.push(circle);

    res.status(201).json({
      message: 'Circle created successfully',
      circle
    });
  } catch (error) {
    console.error('Error creating circle:', error);
    res.status(500).json({ error: 'Server error creating circle' });
  }
});

/**
 * GET /api/circles/:id
 * Fetch a specific circle with details
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const circle = circles.find(circle => circle.id === id);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    res.status(200).json(circle);
  } catch (error) {
    console.error('Error fetching circle:', error);
    res.status(500).json({ error: 'Server error fetching circle' });
  }
});

/**
 * POST /api/circles/:id/join
 * Join a study circle
 * Body: { userId }
 */
router.post('/:id/join', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Find circle
    const circleIndex = circles.findIndex(circle => circle.id === id);
    if (circleIndex === -1) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if already member
    const isMember = circles[circleIndex].members.some(member => member.userId === userId);
    if (isMember) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    // Add user to circle members
    circles[circleIndex].members.push({ userId, joinedAt: new Date() });
    circles[circleIndex].memberCount = circles[circleIndex].members.length;
    
    res.status(200).json({
      message: 'Successfully joined circle',
      memberCount: circles[circleIndex].memberCount
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    res.status(500).json({ error: 'Server error joining circle' });
  }
});

/**
 * POST /api/circles/:id/thread
 * Create a discussion thread
 * Body: { userId, title, content }
 */
router.post('/:id/thread', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    // Find circle
    const circleIndex = circles.findIndex(circle => circle.id === id);
    if (circleIndex === -1) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if user is member
    const isMember = circles[circleIndex].members.some(member => member.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to post' });
    }
    
    // Add thread
    const thread = {
      id: 'thread_' + Date.now(),
      title,
      content,
      authorId: userId,
      createdAt: new Date()
    };
    
    circles[circleIndex].threads.push(thread);
    circles[circleIndex].threadCount = circles[circleIndex].threads.length;
    
    res.status(201).json({
      message: 'Thread created successfully',
      thread
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Server error creating thread' });
  }
});

/**
 * POST /api/circles/:circleId/thread/:threadId/reply
 * Reply to a discussion thread
 * Body: { userId, content }
 */
router.post('/:circleId/thread/:threadId/reply', (req, res) => {
  try {
    const { circleId } = req.params;
    const { userId, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Find circle
    const circleIndex = circles.findIndex(circle => circle.id === circleId);
    if (circleIndex === -1) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if user is member
    const isMember = circles[circleIndex].members.some(member => member.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to reply' });
    }
    
    // In a real app, you would store replies in a separate collection
    // For now, we'll just return a success response
    res.status(201).json({
      message: 'Reply posted successfully',
      reply: {
        id: 'reply_' + Date.now(),
        userId,
        content,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ error: 'Server error posting reply' });
  }
});

module.exports = router;
