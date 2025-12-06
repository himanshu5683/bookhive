// src/utils/errorHandler.js - Error Handling Utilities

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @returns {string} Human-readable error message
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 400:
        return 'Bad Request - Please check your input';
      case 401:
        return 'Unauthorized - Please log in again';
      case 403:
        return 'Forbidden - You do not have permission';
      case 404:
        return 'Not Found - The requested resource does not exist';
      case 500:
        return 'Server Error - Please try again later';
      default:
        return error.response.data?.message || 'An unexpected error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network Error - Please check your connection';
  } else {
    // Other errors
    return error.message || 'An unknown error occurred';
  }
};

/**
 * Log error for debugging
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context) => {
  console.error(`[${context}] Error:`, error);
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'development') {
    console.trace();
  }
};

// Named exports only - no default export to avoid ESLint warnings