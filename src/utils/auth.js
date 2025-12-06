// src/utils/auth.js - Authentication Utilities

/**
 * Get authorization token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set authorization token in localStorage
 * @param {string|null} token - Token to set, or null to remove
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
};

// Named exports only - no default export to avoid ESLint warnings