// src/services/events.js - Events Service

import apiClient from './api';

export const eventsAPI = {
  // Fetch events
  getAll: (params = {}) => apiClient.get('/events', { params }),
  
  // Fetch a specific event
  getById: (id) => apiClient.get(`/events/${id}`),
  
  // Create a new event
  create: (eventData) => apiClient.post('/events', eventData),
  
  // Update an event
  update: (id, updateData) => apiClient.put(`/events/${id}`, updateData),
  
  // Delete an event
  delete: (id) => apiClient.delete(`/events/${id}`),
  
  // Join an event
  join: (id, data) => apiClient.post(`/events/${id}/join`, data),
  
  // Leave an event
  leave: (id, data) => apiClient.post(`/events/${id}/leave`, data)
};

export default eventsAPI;