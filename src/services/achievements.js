import { usersService } from './api';

// Service to fetch user achievements
export const getUserAchievements = async (userId) => {
  try {
    const response = await usersService.getAchievements(userId);
    return response;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

// Service to get all achievements
export const getAllAchievements = async () => {
  try {
    // This would typically call a dedicated achievements endpoint
    // For now, we'll return an empty array as a placeholder
    return [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export default {
  getUserAchievements,
  getAllAchievements
};