// src/services/api.js - API Client Utility
import API_CONFIG from '../config/api';
import { getToken, setToken, isAuthenticated } from '../utils/auth';
import { handleApiError, logError } from '../utils/errorHandler';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Generic fetch wrapper with error handling
 */
const request = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    token = getToken(),
  } = options;

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    fetchOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `API Error: ${response.status}`);
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logError(error, `API Request: ${endpoint}`);
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};

// ============ AUTH ENDPOINTS ============

export const authAPI = {
  signup: (userData) =>
    request('/auth/signup', {
      method: 'POST',
      body: userData,
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  verify: () =>
    request('/auth/verify', {
      method: 'GET',
    }),
};

// ============ RESOURCES ENDPOINTS ============

export const resourcesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/resources?${params.toString()}`, {
      method: 'GET',
    });
  },

  getById: (id) =>
    request(`/resources/${id}`, {
      method: 'GET',
    }),

  create: (resourceData) =>
    request('/resources', {
      method: 'POST',
      body: resourceData,
    }),

  update: (id, updateData) =>
    request(`/resources/${id}`, {
      method: 'PUT',
      body: updateData,
    }),

  delete: (id) =>
    request(`/resources/${id}`, {
      method: 'DELETE',
    }),

  download: (id) =>
    request(`/resources/${id}/download`, {
      method: 'POST',
    }),

  rate: (id, rating) =>
    request(`/resources/${id}/rate`, {
      method: 'POST',
      body: { rating },
    }),
};

// ============ STORIES ENDPOINTS ============

export const storiesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params);
    return request(`/stories?${queryString.toString()}`, {
      method: 'GET',
    });
  },

  create: (storyData) =>
    request('/stories', {
      method: 'POST',
      body: storyData,
    }),

  like: (storyId) =>
    request(`/stories/${storyId}/like`, {
      method: 'POST',
    }),

  unlike: (storyId) =>
    request(`/stories/${storyId}/like`, {
      method: 'DELETE',
    }),

  comment: (storyId, comment) =>
    request(`/stories/${storyId}/comment`, {
      method: 'POST',
      body: { content: comment },
    }),

  delete: (storyId) =>
    request(`/stories/${storyId}`, {
      method: 'DELETE',
    }),
};

// ============ CIRCLES ENDPOINTS ============

export const circlesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params);
    return request(`/circles?${queryString.toString()}`, {
      method: 'GET',
    });
  },

  getById: (id) =>
    request(`/circles/${id}`, {
      method: 'GET',
    }),

  create: (circleData) =>
    request('/circles', {
      method: 'POST',
      body: circleData,
    }),

  join: (circleId) =>
    request(`/circles/${circleId}/join`, {
      method: 'POST',
    }),

  createThread: (circleId, threadData) =>
    request(`/circles/${circleId}/thread`, {
      method: 'POST',
      body: threadData,
    }),

  replyToThread: (circleId, threadId, replyData) =>
    request(`/circles/${circleId}/thread/${threadId}/reply`, {
      method: 'POST',
      body: replyData,
    }),
};

// ============ USERS ENDPOINTS ============

export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params);
    return request(`/users?${queryString.toString()}`, {
      method: 'GET',
    });
  },

  getById: (id) =>
    request(`/users/${id}`, {
      method: 'GET',
    }),

  getLeaderboard: (params = {}) => {
    const queryString = new URLSearchParams(params);
    return request(`/users/leaderboard?${queryString.toString()}`, {
      method: 'GET',
    });
  },

  update: (id, updateData) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: updateData,
    }),

  updateCredits: (id, creditsData) =>
    request(`/users/${id}/credits`, {
      method: 'PUT',
      body: creditsData,
    }),

  getAchievements: (id) =>
    request(`/users/${id}/achievements`, {
      method: 'GET',
    }),

  follow: (id) =>
    request(`/users/${id}/follow`, {
      method: 'POST',
    }),
};

// ============ HELPER FUNCTIONS ============

export { getToken, setToken, isAuthenticated } from '../utils/auth';

const apiClient = {
  authAPI,
  resourcesAPI,
  storiesAPI,
  circlesAPI,
  usersAPI,
  getToken,
  setToken,
  isAuthenticated,
};

export default apiClient;
