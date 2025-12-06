// src/services/achievements.js - Achievements Service

import apiClient from './api';

export const achievementsAPI = {
  // Fetch user achievements
  getAchievements: (userId) => 
    apiClient.get('/achievements', { params: { userId } }),
  
  // Create a new achievement
  createAchievement: (achievementData) => 
    apiClient.post('/achievements', achievementData),
  
  // Get predefined achievement types
  getAchievementTypes: () => 
    apiClient.get('/achievements/types')
};

export default achievementsAPI;