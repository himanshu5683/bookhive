// backend/routes/resources.js - Resources (Notes/PDFs) Routes

const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

/**
 * GET /api/resources
 * Fetch all resources with optional filters
 * Query params: ?type=note&category=Programming&sort=rating&page=1&limit=10&search=query
 * Response: { total, resources: [...], pagination }
 */
router.get('/', async (req, res) => {
  try {
    const { type, category, sort = 'rating', page = 1, limit = 10, search, authorId } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (authorId) query.authorId = authorId;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort
    const sortObj = {};
    if (sort === 'rating') sortObj.rating = -1;
    else if (sort === 'downloads') sortObj.downloads = -1;
    else if (sort === 'recent') sortObj.createdAt = -1;
    else sortObj.rating = -1;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      resources,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Server error fetching resources' });
  }
});

/**
 * POST /api/resources
 * Upload a new resource (note/PDF)
 * Body: { title, description, type, category, author, authorId, fileName, fileSize, tags }
 * Response: { id, ...resource }
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, type, category, author, authorId, fileName, fileSize, tags } = req.body;

    if (!title || !type || !author || !authorId) {
      return res.status(400).json({ error: 'Title, type, author, and authorId required' });
    }

    // Generate tags using AI if not provided
    let finalTags = tags || [category.toLowerCase()];
    if (!tags || tags.length === 0) {
      try {
        const prompt = `Based on this resource, generate 3-5 relevant tags:
Title: ${title}
Description: ${description}
Category: ${category}
Type: ${type}

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
              content: "You are a helpful assistant that generates relevant tags for content. Always respond with valid JSON array of tags."
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
          finalTags = [...new Set([...finalTags, ...aiTags])]; // Merge and deduplicate
        } catch (parseError) {
          // If JSON parsing fails, try to extract from markdown code blocks
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            const aiTags = JSON.parse(jsonMatch[1]);
            finalTags = [...new Set([...finalTags, ...aiTags])]; // Merge and deduplicate
          }
        }
      } catch (error) {
        console.error('AI Tag Generation Error:', error);
      }
    }

    // Create resource
    const resource = new Resource({
      title,
      description,
      type,
      category,
      author,
      authorId,
      fileName,
      fileSize,
      tags: finalTags
    });

    await resource.save();
    
    // Update user contributions and credits
    await User.findByIdAndUpdate(authorId, {
      $inc: { contributions: 1, credits: 100 }
    });
    
    // Create notification for uploader
    const notification = new Notification({
      userId: authorId,
      type: 'resource',
      title: 'Resource Uploaded!',
      message: `Your resource "${title}" has been uploaded successfully. 100 credits awarded!`,
      relatedId: resource._id,
      relatedType: 'resource',
      priority: 'medium'
    });
    await notification.save();

    // Send real-time update via WebSocket
    const wsService = req.app.get('wsService');
    if (wsService) {
      // Broadcast resource creation to all connected clients
      wsService.sendResourceUpdate(resource);
      
      // Send user activity update to the uploader
      wsService.sendUserActivityUpdate(authorId, {
        type: 'resource_upload',
        resourceId: resource._id,
        title: resource.title,
        creditsEarned: 100
      });
    }

    res.status(201).json({
      message: 'Resource uploaded successfully. 100 credits awarded.',
      resource
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ error: 'Server error uploading resource' });
  }
});

/**
 * GET /api/resources/:id
 * Fetch a specific resource
 * Response: { ...resource, content? }
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Server error fetching resource' });
  }
});

/**
 * PUT /api/resources/:id
 * Update a resource
 * Body: { title?, description?, category? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (category) updateFields.category = category;
    
    const resource = await Resource.findByIdAndUpdate(id, updateFields, { new: true });
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Send real-time update via WebSocket
    const wsService = req.app.get('wsService');
    if (wsService) {
      // Broadcast resource update to all connected clients
      wsService.sendResourceUpdate(resource);
    }
    
    res.status(200).json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Server error updating resource' });
  }
});

/**
 * DELETE /api/resources/:id
 * Delete a resource
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Send real-time update via WebSocket
    const wsService = req.app.get('wsService');
    if (wsService) {
      // Broadcast resource deletion to all connected clients
      wsService.sendResourceUpdate({
        _id: id,
        deleted: true
      });
    }
    
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Server error deleting resource' });
  }
});

/**
 * POST /api/resources/:id/download
 * Record download and award/deduct credits
 */
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment download count
    resource.downloads += 1;
    await resource.save();
    
    // Determine credit cost
    const creditCost = resource.isPremium ? resource.premiumPrice : resource.credits;
    
    // Deduct credits from downloader
    const downloader = await User.findById(userId);
    if (downloader && downloader.credits >= creditCost) {
      downloader.credits -= creditCost;
      downloader.downloads = (downloader.downloads || 0) + 1; // Track downloads for achievements
      await downloader.save();
      
      // Award credits to uploader
      const uploader = await User.findById(resource.authorId);
      if (uploader) {
        uploader.credits += creditCost;
        await uploader.save();
        
        // Create notification for uploader
        const notification = new Notification({
          userId: resource.authorId,
          type: 'resource',
          title: 'Resource Downloaded!',
          message: `Someone downloaded your resource "${resource.title}". You've earned ${creditCost} credits!`,
          relatedId: resource._id,
          relatedType: 'resource',
          priority: 'low'
        });
        await notification.save();
      }
      
      // Log activity for achievements
      // In a real implementation, you would call the activity logging endpoint
      
      // Send real-time update via WebSocket
      const wsService = req.app.get('wsService');
      if (wsService) {
        // Broadcast updated resource to all connected clients
        wsService.sendResourceUpdate(resource);
        
        // Send user activity updates
        wsService.sendUserActivityUpdate(userId, {
          type: 'resource_download',
          resourceId: resource._id,
          title: resource.title,
          creditsSpent: creditCost
        });
        
        if (uploader) {
          wsService.sendUserActivityUpdate(resource.authorId, {
            type: 'resource_sale',
            resourceId: resource._id,
            title: resource.title,
            creditsEarned: creditCost
          });
        }
      }
      
      res.status(200).json({
        message: 'Download recorded',
        creditsDeducted: creditCost,
        creditsAwarded: creditCost,
        newCredits: downloader.credits,
        uploaderCredits: uploader ? uploader.credits : 0
      });
    } else {
      res.status(400).json({ error: 'Insufficient credits to download this resource' });
    }
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Server error recording download' });
  }
});

/**
 * POST /api/resources/:id/rate
 * Rate and review a resource
 * Body: { userId, rating, review }
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, review } = req.body;
    
    if (!userId || !rating) {
      return res.status(400).json({ error: 'userId and rating required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Add/update rating
    await resource.addRating(userId, rating, review || '');
    
    // Award credits to reviewer (10 credits for rating)
    const reviewer = await User.findById(userId);
    if (reviewer) {
      reviewer.credits += 10;
      reviewer.ratings = (reviewer.ratings || 0) + 1; // Track ratings for achievements
      if (review) {
        reviewer.reviews = (reviewer.reviews || 0) + 1; // Track reviews for achievements
      }
      await reviewer.save();
    }
    
    // Create notification for resource owner if reviewer is not the owner
    if (resource.authorId !== userId) {
      const notification = new Notification({
        userId: resource.authorId,
        type: 'resource',
        title: 'Resource Rated!',
        message: `Your resource "${resource.title}" received a ${rating}-star rating${review ? ' and review' : ''}.`,
        relatedId: resource._id,
        relatedType: 'resource',
        priority: 'low'
      });
      await notification.save();
    }
    
    // Send real-time update via WebSocket
    const wsService = req.app.get('wsService');
    if (wsService) {
      // Broadcast updated resource to all connected clients
      wsService.sendResourceUpdate(resource);
      
      // Send user activity update to the reviewer
      if (reviewer) {
        wsService.sendUserActivityUpdate(userId, {
          type: 'resource_rating',
          resourceId: resource._id,
          title: resource.title,
          rating: rating,
          creditsEarned: 10
        });
      }
    }
    
    res.status(200).json({
      message: 'Rating submitted successfully. 10 credits awarded.',
      resource,
      newCredits: reviewer ? reviewer.credits : 0
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Server error submitting rating' });
  }
});

/**
 * GET /api/resources/:id/ratings
 * Get all ratings for a resource
 */
router.get('/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({
      ratings: resource.ratings || []
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Server error fetching ratings' });
  }
});

module.exports = router;