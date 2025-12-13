// backend/routes/requests.js - Resource Requests Routes

import express from 'express';
import ResourceRequest from '../models/ResourceRequest.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * GET /api/requests
 * Fetch all resource requests
 * Query: ?status=pending&page=1&limit=20
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await ResourceRequest.countDocuments(query);
    const requests = await ResourceRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      requests,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Server error fetching requests' });
  }
});

/**
 * POST /api/requests
 * Submit a new resource request
 * Body: { title, description, category }
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const requesterId = req.user.id; // Using id from authenticated user (as requested)
    const requesterName = req.user.name;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Create request
    const request = new ResourceRequest({
      title,
      description,
      category: category || 'General',
      requesterId,
      requesterName,
      status: 'pending'
    });

    await request.save();

    res.status(201).json({
      message: 'Request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Server error submitting request' });
  }
});

/**
 * PUT /api/requests/:id/status
 * Update request status (admin/moderator only)
 * Body: { status, resolverId, resolverName }
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolverId, resolverName } = req.body;
    const resolverIdFromAuth = req.user.id; // Using id from authenticated user (as requested)
    const resolverNameFromAuth = req.user.name;

    if (!status || !['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status required' });
    }

    const updateFields = { status };
    // Use authenticated user info instead of request body
    updateFields.resolverId = resolverIdFromAuth;
    updateFields.resolverName = resolverNameFromAuth;
    if (status === 'fulfilled') updateFields.fulfilledAt = new Date();

    const request = await ResourceRequest.findByIdAndUpdate(id, updateFields, { new: true });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Server error updating request status' });
  }
});

export default router;