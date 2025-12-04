// backend/routes/resources.js - Resources (Notes/PDFs) Routes

const express = require('express');

const router = express.Router();

// In-memory storage for development without database
const resources = [
  {
    id: 'res1',
    title: 'Advanced JavaScript',
    description: 'Deep dive into JavaScript concepts',
    type: 'note',
    category: 'Programming',
    author: 'Alice Johnson',
    authorId: 'user1',
    rating: 4.8,
    downloads: 1250,
    credits: 150,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'res2',
    title: 'Quantum Physics Basics',
    description: 'Introduction to quantum mechanics',
    type: 'pdf',
    category: 'Science',
    author: 'Bob Chen',
    authorId: 'user2',
    rating: 4.6,
    downloads: 890,
    credits: 120,
    createdAt: new Date('2024-01-10')
  }
];

/**
 * GET /api/resources
 * Fetch all resources with optional filters
 * Query params: ?type=note&category=Programming&sort=rating&page=1&limit=10
 * Response: { total, resources: [...], pagination }
 */
router.get('/', (req, res) => {
  try {
    const { type, category, sort = 'rating', page = 1, limit = 10 } = req.query;
    
    // Filter resources
    let filteredResources = [...resources];
    if (type) {
      filteredResources = filteredResources.filter(resource => resource.type === type);
    }
    if (category) {
      filteredResources = filteredResources.filter(resource => resource.category === category);
    }
    
    // Sort resources
    filteredResources.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'downloads') return b.downloads - a.downloads;
      if (sort === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return b.rating - a.rating; // default to rating
    });
    
    // Paginate resources
    const skip = (page - 1) * limit;
    const paginatedResources = filteredResources.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      total: filteredResources.length,
      resources: paginatedResources,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: filteredResources.length }
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
router.post('/', (req, res) => {
  try {
    const { title, description, type, category, author, authorId } = req.body;

    if (!title || !type || !author || !authorId) {
      return res.status(400).json({ error: 'Title, type, author, and authorId required' });
    }

    // Create resource
    const resource = {
      id: 'res_' + Date.now(),
      title,
      description,
      type,
      category,
      author,
      authorId,
      rating: 0,
      downloads: 0,
      credits: 100,
      createdAt: new Date()
    };

    resources.push(resource);

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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = resources.find(resource => resource.id === id);
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
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    const resourceIndex = resources.findIndex(resource => resource.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Update resource fields
    if (title) resources[resourceIndex].title = title;
    if (description) resources[resourceIndex].description = description;
    if (category) resources[resourceIndex].category = category;
    
    res.status(200).json({
      message: 'Resource updated successfully',
      resource: resources[resourceIndex]
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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const resourceIndex = resources.findIndex(resource => resource.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    resources.splice(resourceIndex, 1);
    
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
router.post('/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    
    // Find resource
    const resource = resources.find(resource => resource.id === id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment download count
    resource.downloads += 1;
    
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
