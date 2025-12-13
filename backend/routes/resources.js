// backend/routes/resources.js - Resources (Notes/PDFs) Routes

import express from 'express';
import { body, validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import inbuiltAIService from '../services/inbuiltAI.js'; // Import our inbuilt AI service
const { generateResourceTags } = inbuiltAIService;
import dotenv from 'dotenv';
import authenticate from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

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
 * Body: { title, description, type, category, fileName, fileSize, tags }
 * Response: { id, ...resource }
 */
router.post('/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Type is required'),
  ],
  async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, type, category, fileName, fileSize, tags } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const userName = req.user.name;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
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
      author: userName, // Store author name
      authorId: userId.toString(), // Store user ID as string
      fileName,
      fileSize,
      tags: finalTags
    });

    await resource.save();
    
    // Update user contributions and credits
    await User.findByIdAndUpdate(userId, {
      $inc: { contributions: 1, credits: 100 }
    });
    
    // Create notification for uploader
    const notification = new Notification({
      userId: userId,
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
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find resource and check ownership
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    if (resource.authorId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the author can update the resource' });
    }
    
    // Remove protected fields from update
    delete updateData.author;
    delete updateData.authorId;
    delete updateData.fileName;
    delete updateData.fileSize;
    delete updateData.type;
    delete updateData.downloads;
    delete updateData.rating;
    delete updateData.ratings;
    
    const updatedResource = await Resource.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ resource: updatedResource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Server error updating resource' });
  }
});

/**
 * DELETE /api/resources/:id
 * Delete a resource
 * Response: { message }
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find resource and check ownership
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    if (resource.authorId !== userId.toString()) {
      return res.status(403).json({ error: 'Only the author can delete the resource' });
    }
    
    // Delete resource
    await Resource.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Server error deleting resource' });
  }
});

/**
 * POST /api/resources/:id/download
 * Download a resource (increments download count)
 * Response: { message, downloadUrl }
 */
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment download count
    resource.downloads += 1;
    await resource.save();
    
    // Update user downloads count
    await User.findByIdAndUpdate(userId, {
      $inc: { downloads: 1 }
    });
    
    // In a real app, you would generate a signed URL or redirect to the file
    // For now, we'll just return a success message
    res.status(200).json({ 
      message: 'Download initiated successfully',
      downloadUrl: `/download/${resource._id}` // Placeholder URL
    });
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ error: 'Server error downloading resource' });
  }
});

/**
 * POST /api/resources/:id/rate
 * Rate a resource
 * Body: { rating }
 * Response: { message, averageRating }
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Find resource
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if user has already rated
    const existingRatingIndex = resource.ratings.findIndex(r => r.userId.toString() === userId.toString());
    if (existingRatingIndex !== -1) {
      // Update existing rating
      resource.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      resource.ratings.push({
        userId: userId,
        rating: rating
      });
    }
    
    // Recalculate average rating
    const totalRatings = resource.ratings.reduce((sum, r) => sum + r.rating, 0);
    resource.rating = totalRatings / resource.ratings.length;
    
    await resource.save();
    
    res.status(200).json({ 
      message: 'Rating submitted successfully',
      averageRating: resource.rating
    });
  } catch (error) {
    console.error('Error rating resource:', error);
    res.status(500).json({ error: 'Server error rating resource' });
  }
});

export default router;