// src/services/api.js - API Client Utility
import axios from 'axios';
import API_CONFIG from '../config/api';
import { getToken } from '../utils/auth';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || `API Error: ${error.response.status}`;
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Network error
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Other error
      return Promise.reject(new Error('An unexpected error occurred'));
    }
  }
);

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  signup: (userData) => apiClient.post('/auth/signup', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  verify: () => apiClient.get('/auth/verify'),
};

// ============ RESOURCES ENDPOINTS ============

export const resourcesAPI = {
  getAll: (filters = {}) => apiClient.get('/resources', { params: filters }),
  getById: (id) => apiClient.get(`/resources/${id}`),
  create: (resourceData) => apiClient.post('/resources', resourceData),
  update: (id, updateData) => apiClient.put(`/resources/${id}`, updateData),
  delete: (id) => apiClient.delete(`/resources/${id}`),
  download: (id, data) => apiClient.post(`/resources/${id}/download`, data),
  rate: (id, ratingData) => apiClient.post(`/resources/${id}/rate`, ratingData),
};

// ============ STORIES ENDPOINTS ============

export const storiesAPI = {
  getAll: (params = {}) => apiClient.get('/stories', { params }),
  create: (storyData) => apiClient.post('/stories', storyData),
  update: (storyId, storyData) => apiClient.put(`/stories/${storyId}`, storyData),
  like: (storyId) => apiClient.post(`/stories/${storyId}/like`),
  unlike: (storyId) => apiClient.delete(`/stories/${storyId}/like`),
  comment: (storyId, comment) => apiClient.post(`/stories/${storyId}/comment`, { content: comment }),
  delete: (storyId) => apiClient.delete(`/stories/${storyId}`),
};

// ============ CIRCLES ENDPOINTS ============

export const circlesAPI = {
  getAll: (params = {}) => apiClient.get('/circles', { params }),
  getById: (id) => apiClient.get(`/circles/${id}`),
  create: (circleData) => apiClient.post('/circles', circleData),
  join: (circleId) => apiClient.post(`/circles/${circleId}/join`),
  createThread: (circleId, threadData) => apiClient.post(`/circles/${circleId}/thread`, threadData),
  replyToThread: (circleId, threadId, replyData) => apiClient.post(`/circles/${circleId}/thread/${threadId}/reply`, replyData),
};

// ============ USERS ENDPOINTS ============

export const usersAPI = {
  getAll: (params = {}) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  getLeaderboard: (params = {}) => apiClient.get('/users/leaderboard', { params }),
  update: (id, updateData) => apiClient.put(`/users/${id}`, updateData),
  updateCredits: (id, creditsData) => apiClient.put(`/users/${id}/credits`, creditsData),
  updateTags: (id, tagsData) => apiClient.put(`/users/${id}/tags`, tagsData),
  getAchievements: (id) => apiClient.get(`/users/${id}/achievements`),
  follow: (id) => apiClient.post(`/users/${id}/follow`),
};

// ============ AI ENDPOINTS ============

export const aiAPI = {
  getRecommendations: (params) => apiClient.post('/ai/recommendations', params),
  chat: (messageData) => apiClient.post('/ai/chat', messageData),
  summarize: (textData) => apiClient.post('/ai/summarize', textData),
  search: (searchData) => apiClient.post('/ai/search', searchData),
  generateTags: (contentData) => apiClient.post('/ai/generate-tags', contentData),
  autoTag: (contentData) => apiClient.post('/ai/auto-tag', contentData),
  trendDetection: (params) => apiClient.post('/ai/trend-detection', params),
  sentimentAnalysis: (textData) => apiClient.post('/ai/sentiment-analysis', textData),
  eventSuggestions: (params) => apiClient.post('/ai/event-suggestions', params),
};
// ============ ACTIVITY ENDPOINTS ============

export const activityAPI = {
  logActivity: (activityData) => apiClient.post('/activity/log', activityData),
  getUserActivities: (userId, params = {}) => apiClient.get(`/activity/user/${userId}`, { params }),
  getUserActivityStats: (userId) => apiClient.get(`/activity/stats/${userId}`),
};

// ============ TWO-FACTOR AUTHENTICATION ENDPOINTS ============

export const twoFactorAPI = {
  setup: (userId) => apiClient.post('/twofactor/setup', { userId }),
  verify: (userId, token) => apiClient.post('/twofactor/verify', { userId, token }),
  disable: (userId) => apiClient.post('/twofactor/disable', { userId }),
  useRecoveryCode: (userId, code) => apiClient.post('/twofactor/recovery', { userId, code }),
  getStatus: (userId) => apiClient.get(`/twofactor/status/${userId}`),
};

// ============ REQUESTS ENDPOINTS ============

export const requestsAPI = {
  getAll: (params = {}) => apiClient.get('/requests', { params }),
  create: (requestData) => apiClient.post('/requests', requestData),
  updateStatus: (id, statusData) => apiClient.put(`/requests/${id}/status`, statusData),
};

// ============ FEEDBACK ENDPOINTS ============

export const feedbackAPI = {
  getAll: (params = {}) => apiClient.get('/feedback', { params }),
  create: (feedbackData) => apiClient.post('/feedback', feedbackData),
};

// Export the axios instance as default
export default apiClient;