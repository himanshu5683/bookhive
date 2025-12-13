// backend/routes/achievements.js - Achievements Routes

import express from 'express';
import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * GET /api/achievements
 * Fetch current user's achievements
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    const achievements = await Achievement.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      achievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Server error fetching achievements' });
  }
});

/**
 * POST /api/achievements
 * Create a new achievement (admin only)
 * Body: { type, title, description, icon, points, level, criteria }
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, description, icon, points, level, criteria } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    if (!type || !title || !description) {
      return res.status(400).json({ error: 'type, title, and description are required' });
    }
    
    const achievement = new Achievement({
      userId,
      type,
      title,
      description,
      icon,
      points,
      level,
      criteria
    });
    
    await achievement.save();
    
    // Update user badges
    const user = await User.findById(userId);
    if (user) {
      const badgeText = `${icon} ${title}`;
      if (!user.badges.includes(badgeText)) {
        user.badges.push(badgeText);
        await user.save();
      }
    }
    
    res.status(201).json({
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Server error creating achievement' });
  }
});

/**
 * GET /api/achievements/types
 * Get predefined achievement types and criteria
 */
router.get('/types', (req, res) => {
  const achievementTypes = {
    first_upload: {
      type: 'upload',
      title: 'First Upload',
      description: 'Upload your first resource to the community',
      icon: '📤',
      points: 50,
      criteria: { uploads: 1 }
    },
    ten_uploads: {
      type: 'upload',
      title: 'Uploader',
      description: 'Upload 10 resources to the community',
      icon: '📚',
      points: 100,
      criteria: { uploads: 10 }
    },
    fifty_uploads: {
      type: 'upload',
      title: 'Super Uploader',
      description: 'Upload 50 resources to the community',
      icon: '🚀',
      points: 250,
      criteria: { uploads: 50 }
    },
    first_download: {
      type: 'download',
      title: 'First Download',
      description: 'Download your first resource',
      icon: '📥',
      points: 20,
      criteria: { downloads: 1 }
    },
    ten_downloads: {
      type: 'download',
      title: 'Explorer',
      description: 'Download 10 resources',
      icon: '🔍',
      points: 50,
      criteria: { downloads: 10 }
    },
    first_rating: {
      type: 'rating',
      title: 'Reviewer',
      description: 'Rate your first resource',
      icon: '⭐',
      points: 30,
      criteria: { ratings: 1 }
    },
    five_ratings: {
      type: 'rating',
      title: 'Critic',
      description: 'Rate 5 resources',
      icon: '🎭',
      points: 75,
      criteria: { ratings: 5 }
    },
    first_review: {
      type: 'review',
      title: 'Commentator',
      description: 'Write your first review',
      icon: '✍️',
      points: 40,
      criteria: { reviews: 1 }
    },
    social_butterfly: {
      type: 'social',
      title: 'Social Butterfly',
      description: 'Join 3 study circles',
      icon: '🦋',
      points: 100,
      criteria: { circles: 3 }
    },
    community_leader: {
      type: 'social',
      title: 'Community Leader',
      description: 'Create 2 study circles',
      icon: '👑',
      points: 150,
      criteria: { created_circles: 2 }
    },
    milestone_1000: {
      type: 'milestone',
      title: 'Thousand Points Club',
      description: 'Earn 1000 credits',
      icon: '💎',
      points: 0, // No additional points since it's based on credits
      criteria: { credits: 1000 }
    }
  };
  
  res.status(200).json({
    achievementTypes
  });
});

export default router;