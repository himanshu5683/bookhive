// backend/routes/notifications.js - Notifications Routes

import express from 'express';
import Notification from '../models/Notification';

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch user notifications
 * Query params: ?userId=&limit=&skip=
 */
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20, skip = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
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
 * Create a new notification
 * Body: { userId, type, title, message, relatedId, relatedType, priority }
 */
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, relatedId, relatedType, priority } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'userId, type, title, and message are required' });
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
    
    const notification = await Notification.findByIdAndUpdate(
      id, 
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
 * Mark all user notifications as read
 * Body: { userId }
 */
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    await Notification.updateMany(
      { userId, read: false },
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
    
    const notification = await Notification.findByIdAndDelete(id);
    
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