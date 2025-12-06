// src/hooks/useResources.js - Custom hook for managing resources with real-time updates

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import apiClient from '../services/api';

const useResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe, connected } = useWebSocket();

  // Fetch all resources
  const fetchResources = useCallback(async (sortBy = 'recent') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.resourcesAPI.getAll({ sort: sortBy });
      setResources(response.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      setError('Failed to load resources. Please try again.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new resource
  const addResource = useCallback((newResource) => {
    setResources(prevResources => [newResource, ...prevResources]);
  }, []);

  // Update an existing resource
  const updateResource = useCallback((updatedResource) => {
    setResources(prevResources => 
      prevResources.map(resource => 
        resource._id === updatedResource._id ? updatedResource : resource
      )
    );
  }, []);

  // Remove a resource
  const removeResource = useCallback((resourceId) => {
    setResources(prevResources => 
      prevResources.filter(resource => resource._id !== resourceId)
    );
  }, []);

  // Handle WebSocket resource updates
  useEffect(() => {
    if (!connected) return;

    // Subscribe to resource updates
    const unsubscribe = subscribe('resource_updated', (data) => {
      if (data.deleted) {
        // Handle resource deletion
        removeResource(data._id);
      } else if (resources.some(r => r._id === data._id)) {
        // Handle resource update
        updateResource(data);
      } else {
        // Handle new resource
        addResource(data);
      }
    });

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, subscribe, resources, addResource, updateResource, removeResource]);

  return {
    resources,
    loading,
    error,
    fetchResources,
    addResource,
    updateResource,
    removeResource
  };
};

export default useResources;