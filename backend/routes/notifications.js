// backend/routes/notifications.js - Notifications Routes

import express from 'express';
import Notification from '../models/Notification.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * GET /api/notifications
 * Fetch current user's notifications
 * Query params: ?limit=&skip=
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const { limit = 20, skip = 0 } = req.query;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    
    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (admin/system only)
 * Body: { type, title, message, relatedId, relatedType, priority }
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, message, relatedId, relatedType, priority } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title, and message are required' });
    }
    
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      priority
    });
    
    await notification.save();
    
    // Send real-time notification via WebSocket if available
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.sendNotificationUpdate(userId, notification);
    }
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server error creating notification' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: userId }, 
      { read: true }, 
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all current user's notifications as read
 */
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    await Notification.updateMany(
      { userId: userId, read: false },
      { read: true }
    );
    
    res.status(200).json({
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Server error marking all notifications as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    const notification = await Notification.findOneAndDelete({ _id: id, userId: userId });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Server error deleting notification' });
  }
});

export default router;