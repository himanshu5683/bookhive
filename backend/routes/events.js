// backend/routes/events.js - Events Routes for Live Events/Webinars

const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * GET /api/events
 * Fetch events with optional filters
 * Query params: ?category=&status=&limit=&page=
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, limit = 20, page = 1 } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error fetching events' });
  }
});

/**
 * GET /api/events/:id
 * Fetch a specific event
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Server error fetching event' });
  }
});

/**
 * POST /api/events
 * Create a new event
 * Body: { title, description, host, hostId, startDate, endDate, timezone, category, maxParticipants, meetingLink }
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, host, hostId, startDate, endDate, timezone, category, maxParticipants, meetingLink } = req.body;

    if (!title || !description || !host || !hostId || !startDate || !endDate || !category) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    if (start < new Date()) {
      return res.status(400).json({ error: 'Start date must be in the future' });
    }

    // Generate tags using AI
    let tags = [category.toLowerCase()];
    try {
      const prompt = `Based on this event, generate 3-5 relevant tags:
Title: ${title}
Description: ${description}
Category: ${category}

Return the tags as a JSON array with the following format:
[
  "tag1",
  "tag2",
  "tag3"
]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates relevant tags for events. Always respond with valid JSON array of tags."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      const responseText = completion.choices[0].message.content;
      
      // Try to parse as JSON
      try {
        const aiTags = JSON.parse(responseText);
        tags = [...new Set([...tags, ...aiTags])]; // Merge and deduplicate
      } catch (parseError) {
        // If JSON parsing fails, try to extract from markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const aiTags = JSON.parse(jsonMatch[1]);
          tags = [...new Set([...tags, ...aiTags])]; // Merge and deduplicate
        }
      }
    } catch (error) {
      console.error('AI Tag Generation Error:', error);
    }

    // Create event
    const event = new Event({
      title,
      description,
      host,
      hostId,
      startDate: start,
      endDate: end,
      timezone: timezone || 'UTC',
      category,
      maxParticipants: maxParticipants || 100,
      meetingLink,
      tags
    });

    await event.save();
    
    // Create notification for host
    const notification = new Notification({
      userId: hostId,
      type: 'system',
      title: 'Event Created!',
      message: `Your event "${title}" has been scheduled for ${start.toLocaleDateString()}.`,
      relatedId: event._id,
      relatedType: 'event',
      priority: 'medium'
    });
    await notification.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error creating event' });
  }
});

/**
 * PUT /api/events/:id
 * Update an event
 * Body: { title?, description?, startDate?, endDate?, timezone?, category?, maxParticipants?, meetingLink?, status? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, timezone, category, maxParticipants, meetingLink, status } = req.body;
    
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (startDate) updateFields.startDate = new Date(startDate);
    if (endDate) updateFields.endDate = new Date(endDate);
    if (timezone) updateFields.timezone = timezone;
    if (category) updateFields.category = category;
    if (maxParticipants) updateFields.maxParticipants = maxParticipants;
    if (meetingLink) updateFields.meetingLink = meetingLink;
    if (status) updateFields.status = status;
    
    const event = await Event.findByIdAndUpdate(id, updateFields, { new: true });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // If event status changed to live or completed, notify participants
    if (status && (status === 'live' || status === 'completed')) {
      for (const participant of event.participants) {
        const notification = new Notification({
          userId: participant.userId,
          type: 'system',
          title: `Event ${status === 'live' ? 'Started' : 'Ended'}!`,
          message: `The event "${event.title}" is now ${status === 'live' ? 'live' : 'completed'}.`,
          relatedId: event._id,
          relatedType: 'event',
          priority: 'medium'
        });
        await notification.save();
      }
    }
    
    res.status(200).json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error updating event' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete an event
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

/**
 * POST /api/events/:id/join
 * Join an event
 * Body: { userId, userName }
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ error: 'userId and userName required' });
    }
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if user already joined
    const alreadyJoined = event.participants.some(p => p.userId === userId);
    if (alreadyJoined) {
      return res.status(400).json({ error: 'Already joined this event' });
    }
    
    // Add participant
    event.participants.push({
      userId,
      name: userName
    });
    
    event.currentParticipants = event.participants.length;
    await event.save();
    
    // Create notification for event host
    const notification = new Notification({
      userId: event.hostId,
      type: 'system',
      title: 'New Participant!',
      message: `${userName} joined your event "${event.title}".`,
      relatedId: event._id,
      relatedType: 'event',
      priority: 'low'
    });
    await notification.save();
    
    res.status(200).json({
      message: 'Successfully joined event',
      event
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Server error joining event' });
  }
});

/**
 * POST /api/events/:id/leave
 * Leave an event
 * Body: { userId }
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Remove participant
    event.participants = event.participants.filter(p => p.userId !== userId);
    event.currentParticipants = event.participants.length;
    await event.save();
    
    res.status(200).json({
      message: 'Successfully left event',
      event
    });
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ error: 'Server error leaving event' });
  }
});

module.exports = router;