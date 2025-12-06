// src/services/notifications.js - Notifications Service

import apiClient from './api';

export const notificationsAPI = {
  // Fetch user notifications
  getNotifications: (userId, limit = 20, skip = 0) => 
    apiClient.get('/notifications', { params: { userId, limit, skip } }),
  
  // Create a new notification
  createNotification: (notificationData) => 
    apiClient.post('/notifications', notificationData),
  
  // Mark notification as read
  markAsRead: (id) => 
    apiClient.put(`/notifications/${id}/read`),
  
  // Mark all notifications as read
  markAllAsRead: (userId) => 
    apiClient.put('/notifications/read-all', { userId }),
  
  // Delete a notification
  deleteNotification: (id) => 
    apiClient.delete(`/notifications/${id}`)
};

export default notificationsAPI;