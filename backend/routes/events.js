// backend/routes/events.js - Events Routes for Live Events/Webinars

import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

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
      query.date = { $gte: new Date() };
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
      .populate('attendees', 'name email avatar')
      .sort({ date: 1 })
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
      .populate('attendees', 'name email avatar');
    
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
    const userId = req.user._id; // User object is attached by auth middleware
    const userName = req.user.name;
    
    // Validate required fields
    if (!title || !description || !startDate || !endDate || !category || !format) {
      return res.status(400).json({ error: 'Title, description, startDate, endDate, category, and format are required' });
    }
    
    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (startDateTime < new Date()) {
      return res.status(400).json({ error: 'Event start date must be in the future' });
    }
    
    if (endDateTime <= startDateTime) {
      return res.status(400).json({ error: 'Event end date must be after start date' });
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
    const userId = req.user._id;
    
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
    const userId = req.user._id;
    
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

/**
 * POST /api/events/:id/register
 * Register for event
 */
router.post('/:id/register', async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name;
    
    // Find event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is already registered
    if (event.participants.some(p => p.userId === userId.toString())) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Check capacity
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }
    
    // Add user to participants
    event.participants.push({
      userId: userId.toString(),
      name: userName
    });
    event.currentParticipants = event.participants.length;
    await event.save();
    
    // Create notification
    await Notification.create({
      userId: userId,
      type: 'event_registration',
      message: `You've successfully registered for "${event.title}"`,
      data: { eventId: event._id }
    });
    
    res.json({ message: 'Successfully registered for the event', event });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

/**
 * POST /api/events/:id/suggest
 * Get AI-powered event suggestions
 */
router.post('/:id/suggest', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Generate AI suggestions based on event details
    const prompt = `
      Based on this event:
      Title: ${event.title}
      Description: ${event.description}
      Category: ${event.category}
      Format: ${event.format}
      
      Suggest 3 related events that users might be interested in. Return as JSON array with:
      - title
      - briefDescription
      - suggestedCategory
      - format
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an event suggestion engine. Return only valid JSON array."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Try to parse AI response
    let suggestions;
    try {
      suggestions = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      suggestions = [
        {
          title: "Related Educational Event",
          briefDescription: "An event related to your interests",
          suggestedCategory: event.category,
          format: event.format
        }
      ];
    }
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating event suggestions:', error);
    res.status(500).json({ error: 'Failed to generate event suggestions' });
  }
});

export default router;