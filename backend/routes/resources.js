// backend/routes/resources.js - Resources (Notes/PDFs) Routes

const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/resources
 * Fetch all resources with optional filters
 * Query params: ?type=note&category=Programming&sort=rating&page=1&limit=10
 * Response: { total, resources: [...], pagination }
 */
router.get('/', async (req, res) => {
  try {
    const { type, category, sort = 'rating', page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    
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
 * Body: { title, description, type, category, author, authorId }
 * Response: { id, ...resource }
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, type, category, author, authorId } = req.body;

    if (!title || !type || !author || !authorId) {
      return res.status(400).json({ error: 'Title, type, author, and authorId required' });
    }

    // Create resource
    const resource = new Resource({
      title,
      description,
      type,
      category,
      author,
      authorId
    });

    await resource.save();
    
    // Update user contributions
    await User.findByIdAndUpdate(authorId, {
      $inc: { contributions: 1, credits: 100 }
    });

    res.status(201).json({
      message: 'Resource uploaded successfully',
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
    
    // Deduct credits from downloader
    const downloader = await User.findById(userId);
    if (downloader && downloader.credits >= resource.credits) {
      downloader.credits -= resource.credits;
      await downloader.save();
    }
    
    // Award credits to uploader
    const uploader = await User.findById(resource.authorId);
    if (uploader) {
      uploader.credits += resource.credits;
      await uploader.save();
    }
    
    res.status(200).json({
      message: 'Download recorded',
      creditsDeducted: resource.credits,
      creditsAwarded: resource.credits
    });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Server error recording download' });
  }
});

module.exports = router;
