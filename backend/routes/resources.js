// backend/routes/resources.js - Resources (Notes/PDFs) Routes

const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateResourceTags } = require('../services/inbuiltAI'); // Import our inbuilt AI service
require('dotenv').config();

const router = express.Router();

/**
 * GET /api/resources
 * Get all resources with optional filters
 * Query: { page, limit, category, type, search, sort }
 * Response: { total, resources, pagination }
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, type, search, sort } = req.query;
    
    // Build query
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type;
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

    // Generate tags using our inbuilt AI if not provided
    let finalTags = tags || [category.toLowerCase()];
    if (!tags || tags.length === 0) {
      try {
        const aiTags = generateResourceTags(title, description, category, type);
        finalTags = [...new Set([...finalTags, ...aiTags])]; // Merge and deduplicate
      } catch (error) {
        console.error('AI Tag Generation Error:', error);
        // Fallback to basic category-based tags
        finalTags = [category.toLowerCase(), type];
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
      message: `Your resource "${title}" has been successfully uploaded. You earned 100 credits!`,
      link: `/resources/${resource._id}`
    });
    
    await notification.save();
    
    res.status(201).json({ 
      message: 'Resource created successfully', 
      resource,
      notification
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid resource data' });
    }
    res.status(500).json({ error: 'Server error uploading resource' });
  }
});

/**
 * GET /api/resources/:id
 * Get a specific resource by ID
 * Response: { resource }
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({ resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    res.status(500).json({ error: 'Server error fetching resource' });
  }
});

/**
 * PUT /api/resources/:id
 * Update a resource
 * Body: { title, description, category, tags, isPremium, premiumPrice }
 * Response: { resource }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove protected fields from update
    delete updateData.author;
    delete updateData.authorId;
    delete updateData.fileName;
    delete updateData.fileSize;
    delete updateData.type;
    delete updateData.downloads;
    delete updateData.rating;
    delete updateData.ratings;
    
    const resource = await Resource.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({ resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid update data' });
    }
    res.status(500).json({ error: 'Server error updating resource' });
  }
});

/**
 * DELETE /api/resources/:id
 * Delete a resource
 * Response: { message: 'Resource deleted successfully' }
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid resource ID' });
    }
    res.status(500).json({ error: 'Server error deleting resource' });
  }
});

/**
 * POST /api/resources/:id/download
 * Download a resource (decrement credits if premium)
 * Body: { userId }
 * Response: { downloadUrl }
 */
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Fetch resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if user has enough credits for premium resources
    if (resource.isPremium && userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.credits < resource.premiumPrice) {
        return res.status(400).json({ error: 'Insufficient credits' });
      }
      
      // Deduct credits
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: -resource.premiumPrice }
      });
      
      // Award credits to author
      await User.findByIdAndUpdate(resource.authorId, {
        $inc: { credits: Math.floor(resource.premiumPrice * 0.7) } // 70% to author
      });
    }
    
    // Increment download count
    await Resource.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    
    // In a real app, this would return a signed URL to the actual file
    // For now, we'll just return a mock URL
    const downloadUrl = `${process.env.BACKEND_URL || 'http://localhost:5002'}/uploads/${resource.fileName}`;
    
    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error('Error downloading resource:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid resource or user ID' });
    }
    res.status(500).json({ error: 'Server error downloading resource' });
  }
});

/**
 * POST /api/resources/:id/rate
 * Rate a resource
 * Body: { userId, rating }
 * Response: { resource }
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating } = req.body;
    
    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid userId and rating (1-5) required' });
    }
    
    // Fetch resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if user already rated
    const existingRatingIndex = resource.ratings.findIndex(r => r.userId.toString() === userId);
    
    if (existingRatingIndex > -1) {
      // Update existing rating
      resource.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      resource.ratings.push({ userId, rating });
    }
    
    // Recalculate average rating
    const totalRating = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
    resource.rating = totalRating / resource.ratings.length;
    
    await resource.save();
    
    res.status(200).json({ resource });
  } catch (error) {
    console.error('Error rating resource:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid resource or user ID' });
    }
    res.status(500).json({ error: 'Server error rating resource' });
  }
});

module.exports = router;