// backend/routes/events.js - Events Routes for Live Events/Webinars

import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import authenticate from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Initialize OpenAI client
let openai = null;

// Only initialize if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * GET /api/events
 * Fetch all events
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, upcoming = true, search } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by upcoming events
    if (upcoming === 'true' || upcoming === true) {
      query.startDate = { $gte: new Date() };
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch events with pagination
    const events = await Event.find(query)
      .populate('host', 'name email avatar')
      .populate('participants.userId', 'name email avatar')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/events/:id
 * Fetch specific event
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('host', 'name email avatar')
      .populate('participants.userId', 'name email avatar');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * POST /api/events
 * Create new event
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, category, format, maxParticipants } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;
    
    // Validate all required fields
    const requiredFields = { title, description, startDate, endDate, category, format };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Ensure both dates are valid
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    // Ensure start date is in the future (with timezone safety)
    const now = new Date();
    if (startDateTime.getTime() <= now.getTime()) {
      return res.status(400).json({ error: 'Event start date must be in the future' });
    }
    
    // Ensure end date is after start date (with timezone safety)
    if (endDateTime.getTime() <= startDateTime.getTime()) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Create new event
    const event = new Event({
      title,
      description,
      startDate: startDateTime,
      endDate: endDateTime,
      category,
      format,
      maxParticipants: maxParticipants || 100,
      host: userName,
      hostId: userId.toString(),
      participants: [{
        userId: userId.toString(),
        name: userName
      }]
    });
    
    await event.save();
    
    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate, category, format, maxParticipants } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find event and check ownership
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.hostId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the host can update the event' });
    }
    
    // Update event fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (startDate) {
      const startDateTime = new Date(startDate);
      if (!isNaN(startDateTime.getTime()) && startDateTime > new Date()) {
        event.startDate = startDateTime;
      }
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      if (!isNaN(endDateTime.getTime()) && endDateTime > new Date()) {
        event.endDate = endDateTime;
      }
    }
    if (category) event.category = category;
    if (format) event.format = format;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    
    await event.save();
    
    res.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find event and check ownership
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.hostId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the host can delete the event' });
    }
    
    // Delete event
    await event.remove();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;