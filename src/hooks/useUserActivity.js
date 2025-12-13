// src/hooks/useUserActivity.js - Custom hook for managing user activity with real-time updates

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { dashboardService } from '../services/api';

const useUserActivity = (userId) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ credits: 0, contributions: 0, downloads: 0, ratings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe, connected } = useWebSocket();

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getById(userId);
      if (response.user) {
        setStats({
          credits: response.user.credits || 0,
          contributions: response.user.contributions || 0,
          downloads: response.user.downloads || 0,
          ratings: response.user.ratings || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      setError('Failed to load user statistics.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add a new activity
  const addActivity = useCallback((newActivity) => {
    setActivities(prevActivities => [newActivity, ...prevActivities]);
    
    // Update stats based on activity type
    switch (newActivity.type) {
      case 'resource_upload':
        setStats(prevStats => ({
          ...prevStats,
          credits: prevStats.credits + (newActivity.creditsEarned || 0),
          contributions: prevStats.contributions + 1
        }));
        break;
      case 'resource_download':
        setStats(prevStats => ({
          ...prevStats,
          credits: prevStats.credits - (newActivity.creditsSpent || 0),
          downloads: prevStats.downloads + 1
        }));
        break;
      case 'resource_sale':
        setStats(prevStats => ({
          ...prevStats,
          credits: prevStats.credits + (newActivity.creditsEarned || 0)
        }));
        break;
      case 'resource_rating':
        setStats(prevStats => ({
          ...prevStats,
          credits: prevStats.credits + (newActivity.creditsEarned || 0),
          ratings: prevStats.ratings + 1
        }));
        break;
      default:
        break;
    }
  }, []);

  // Handle WebSocket user activity updates
  useEffect(() => {
    if (!connected || !userId) return;

    // Subscribe to user activity updates
    const unsubscribe = subscribe('user_activity', (data) => {
      if (data.userId === userId) {
        addActivity(data);
      }
    });

    // Fetch initial stats
    fetchUserStats();

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, subscribe, userId, addActivity, fetchUserStats]);

  return {
    activities,
    stats,
    loading,
    error,
    fetchUserStats,
    addActivity
  };
};

export default useUserActivity;