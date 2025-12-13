// backend/routes/circles.js - Study Circles Routes

import express from 'express';
import StudyCircle from '../models/StudyCircle.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * GET /api/circles
 * Fetch all study circles
 * Query: ?topic=Programming&page=1&limit=10
 */
router.get('/', async (req, res) => {
  try {
    const { topic, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (topic) query.topic = topic;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await StudyCircle.countDocuments(query);
    const circles = await StudyCircle.find(query)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      circles,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching circles:', error);
    res.status(500).json({ error: 'Server error fetching circles' });
  }
});

/**
 * POST /api/circles
 * Create a new study circle
 * Body: { name, topic, description }
 */
router.post('/', async (req, res) => {
  try {
    const { name, topic, description } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;

    if (!name || !topic) {
      return res.status(400).json({ error: 'Name and topic are required' });
    }

    // Create circle
    const circle = new StudyCircle({
      name,
      topic,
      description,
      createdBy: userId.toString(), // Store user ID as string
      creatorName: userName, // Store creator name
      members: [{ userId: userId.toString(), name: userName, joinedAt: new Date() }],
      threads: [],
      memberCount: 1,
      threadCount: 0
    });

    await circle.save();

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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const circle = await StudyCircle.findById(id);
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
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;
    
    // Find circle
    const circle = await StudyCircle.findById(id);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if already member
    const isMember = circle.members.some(member => member.userId === userId.toString());
    if (isMember) {
      // Return 200 with success message instead of 400 error to prevent error spam
      return res.status(200).json({ message: 'Already a member', memberCount: circle.memberCount });
    }
    
    // Add user to circle members
    circle.members.push({ userId: userId.toString(), name: userName, joinedAt: new Date() });
    circle.memberCount = circle.members.length;
    
    await circle.save();
    
    res.status(200).json({
      message: 'Successfully joined circle',
      memberCount: circle.memberCount
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    res.status(500).json({ error: 'Server error joining circle' });
  }
});

/**
 * POST /api/circles/:id/thread
 * Create a discussion thread
 * Body: { title, content }
 */
router.post('/:id/thread', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    // Find circle
    const circle = await StudyCircle.findById(id);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    
    // Check if user is member
    const isMember = circle.members.some(member => member.userId === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to post' });
    }
    
    // Add thread
    const thread = {
      title,
      content,
      authorId: userId.toString(),
      authorName: userName,
      createdAt: new Date()
    };
    
    circle.threads.push(thread);
    circle.threadCount = circle.threads.length;
    
    await circle.save();
    
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
 * Body: { content }
 */
router.post('/:circleId/thread/:threadId/reply', async (req, res) => {
  try {
    const { circleId, threadId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;

    if (!content) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Find circle
    const circle = await StudyCircle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ error: 'Circle not found' });
    }

    // Find thread
    const threadIndex = circle.threads.findIndex(t => t._id.toString() === threadId);
    if (threadIndex === -1) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user is member
    const isMember = circle.members.some(member => member.userId === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'Must be a member to reply' });
    }

    // Add reply to thread
    const reply = {
      content,
      authorId: userId.toString(),
      authorName: userName,
      createdAt: new Date()
    };

    circle.threads[threadIndex].replies = circle.threads[threadIndex].replies || [];
    circle.threads[threadIndex].replies.push(reply);

    await circle.save();

    res.status(201).json({
      message: 'Reply added successfully',
      reply
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Server error adding reply' });
  }
});

export default router;