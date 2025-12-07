// backend/routes/feedback.js - User Feedback Routes

import express from 'express';
import Feedback from '../models/Feedback';

const router = express.Router();

/**
 * GET /api/feedback
 * Fetch all feedback
 * Query: ?type=bug&page=1&limit=20
 */
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      feedbacks,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Server error fetching feedback' });
  }
});

/**
 * POST /api/feedback
 * Submit new feedback
 * Body: { type, title, description, userId, userName }
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, description, userId, userName } = req.body;

    if (!type || !title || !description || !userId || !userName) {
      return res.status(400).json({ error: 'Type, title, description, userId, and userName required' });
    }

    // Create feedback
    const feedback = new Feedback({
      type,
      title,
      description,
      userId,
      userName
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
});

export default router;