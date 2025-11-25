// backend/routes/resources.js - Resources (Notes/PDFs) Routes

const express = require('express');
const router = express.Router();

/**
 * GET /api/resources
 * Fetch all resources with optional filters
 * Query params: ?type=note&category=Programming&sort=rating&page=1&limit=10
 * Response: { total, resources: [...], pagination }
 */
router.get('/', (req, res) => {
  const { type, category, sort, page = 1, limit = 10 } = req.query;

  // TODO: Query database with filters
  // Filter by type (note, pdf)
  // Filter by category (Programming, Science, etc.)
  // Sort by (rating, downloads, recent)
  // Implement pagination

  res.status(200).json({
    total: 5,
    resources: [
      {
        id: 'res1',
        title: 'Advanced JavaScript',
        author: 'Alice Johnson',
        type: 'note',
        category: 'Programming',
        description: 'Deep dive into JavaScript concepts',
        rating: 4.8,
        downloads: 1250,
        credits: 150,
        timestamp: new Date(),
      },
    ],
    pagination: { page: 1, limit: 10, total: 5 },
  });
});

/**
 * POST /api/resources
 * Upload a new resource (note/PDF)
 * Body: { title, description, type, category, file, authorId }
 * Response: { id, ...resource }
 */
router.post('/', (req, res) => {
  const { title, description, type, category } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type required' });
  }

  // TODO: Verify authentication (JWT)
  // TODO: Handle file upload (multer)
  // TODO: Store file and metadata in database
  // TODO: Award credits to uploader (e.g., +100 credits)

  res.status(201).json({
    message: 'Resource uploaded successfully',
    resource: {
      id: 'res_new',
      title,
      type,
      category,
      description,
      rating: 0,
      downloads: 0,
      credits: 100,
    },
  });
});

/**
 * GET /api/resources/:id
 * Fetch a specific resource
 * Response: { ...resource, content? }
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // TODO: Query database for resource
  // TODO: Increment download count
  // TODO: Deduct credits from downloader (if applicable)

  res.status(200).json({
    id,
    title: 'Sample Resource',
    author: 'John Doe',
    type: 'note',
    category: 'Programming',
    rating: 4.5,
    downloads: 500,
    credits: 150,
    description: 'A detailed resource about the topic',
  });
});

/**
 * PUT /api/resources/:id
 * Update a resource
 * Body: { title?, description?, category? }
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;

  // TODO: Verify ownership (JWT)
  // TODO: Update database

  res.status(200).json({
    message: 'Resource updated successfully',
    resource: { id, title, description, category },
  });
});

/**
 * DELETE /api/resources/:id
 * Delete a resource
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // TODO: Verify ownership
  // TODO: Delete from database and file storage

  res.status(200).json({ message: 'Resource deleted successfully' });
});

/**
 * POST /api/resources/:id/download
 * Record download and award/deduct credits
 */
router.post('/:id/download', (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId;

  // TODO: Verify authentication
  // TODO: Increment download count for resource
  // TODO: Deduct credits from downloader
  // TODO: Award credits to uploader

  res.status(200).json({
    message: 'Download recorded',
    downloadUrl: '/path/to/file',
    creditsDeducted: 10,
    creditsAwarded: 10,
  });
});

module.exports = router;
