import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthContext from '../auth/AuthContext';
import { notificationsAPI } from '../services/notifications';
import { useWebSocket } from './WebSocketContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    console.warn('useNotifications must be used within a NotificationProvider');
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: async () => {},
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      addNotification: () => {},
      removeNotification: async () => {}
    };
  }
  
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Get user and loading state from AuthContext
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const authLoading = authContext?.loading || false;

  // Get WebSocket context
  const { connected, subscribe } = useWebSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // Only fetch notifications if user exists and auth is not loading
    if (!user || authLoading) return;
    
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications(user.id);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, authLoading, fetchNotifications]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    // Only subscribe if user exists, auth is not loading, and WebSocket is connected
    if (!user || authLoading || !connected) return;
    
    const unsubscribe = subscribe('notification_created', (notification) => {
      // Add new notification to the top of the list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    return unsubscribe;
  }, [user, authLoading, connected, subscribe]);

  const markAsRead = async (id) => {
    // Only mark as read if user exists and auth is not loading
    if (!user || authLoading) return;
    
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Only mark all as read if user exists and auth is not loading
    if (!user || authLoading) return;
    
    try {
      await notificationsAPI.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    // Only add notification if user exists and auth is not loading
    if (!user || authLoading) return;
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const removeNotification = async (id) => {
    // Only remove notification if user exists and auth is not loading
    if (!user || authLoading) return;
    
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;