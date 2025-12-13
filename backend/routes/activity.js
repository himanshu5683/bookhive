// backend/routes/activity.js - User Activity Logging Routes

import express from 'express';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Notification from '../models/Notification.js';
import Achievement from '../models/Achievement.js';
import Activity from '../models/Activity.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import authenticate from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Initialize OpenAI client
let openai = null;

// Only initialize if API key is provided
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * POST /api/activity/log
 * Log user activity
 */
router.post('/log', async (req, res) => {
  try {
    const { action, details } = req.body;
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Validate required fields
    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }
    
    // Validate payload before logging
    if (details && typeof details !== 'object') {
      return res.status(400).json({ error: 'details must be an object' });
    }
    
    // Create activity record
    const activity = new Activity({
      userId,
      action,
      details
    });
    
    await activity.save();
    
    // Update user activity stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        contributions: action === 'upload' ? 1 : 0,
        downloads: action === 'download' ? 1 : 0
      }
    });
    
    // Check for achievements
    await checkAchievements(userId, action);
    
    res.status(201).json({ activity });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

/**
 * GET /api/activity/user
 * Get current user's activity history
 */
router.get('/user', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const { limit = 50, offset = 0 } = req.query;
    
    const activities = await Activity.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Activity.countDocuments({ userId: userId });
    
    res.json({ activities, total });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/activity/stats
 * Get current user's activity statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Get total activities
    const totalActivities = await Activity.countDocuments({ userId: userId });
    
    // Get activity breakdown by type
    const activityTypes = await Activity.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await Activity.countDocuments({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      totalActivities,
      activityTypes,
      recentActivities,
      weeklyAverage: Math.round(totalActivities / 7)
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

/**
 * POST /api/activity/analyze
 * Analyze user activity with AI
 */
router.post('/analyze', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const { timeframe = 'month' } = req.body;
    
    // Get user activities for the specified timeframe
    const startDate = new Date();
    if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const activities = await Activity.find({
      userId: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    if (activities.length === 0) {
      return res.json({ analysis: 'No activities found for the specified timeframe.' });
    }
    
    // Prepare activity data for AI analysis
    const activitySummary = activities.map(activity => ({
      action: activity.action,
      date: activity.createdAt.toISOString().split('T')[0],
      resource: activity.resourceId ? 'with resource' : 'without resource'
    }));
    
    let analysis;
    
    if (openai) {
      // Generate AI analysis
      const prompt = `
        Analyze the following user activity pattern and provide insights:
        
        Activities:
        ${JSON.stringify(activitySummary, null, 2)}
        
        Please provide:
        1. Overall engagement level
        2. Most active periods
        3. Preferred activities
        4. Suggestions for improvement
        5. Personalized recommendations
        
        Format your response as JSON with these keys: engagementLevel, activePeriods, preferredActivities, suggestions, recommendations
      `;
      
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an educational platform activity analyzer. Provide concise, actionable insights."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });
        
        // Try to parse AI response
        try {
          analysis = JSON.parse(completion.choices[0].message.content);
        } catch (parseError) {
          analysis = {
            engagementLevel: "Moderate",
            activePeriods: ["Various times"],
            preferredActivities: ["Mixed activities"],
            suggestions: ["Continue engaging with the platform regularly"],
            recommendations: ["Explore new features and resources"]
          };
        }
      } catch (aiError) {
        console.warn('Failed to generate AI analysis:', aiError.message);
        // Use default analysis as fallback
        analysis = {
          engagementLevel: "Moderate",
          activePeriods: ["Various times"],
          preferredActivities: ["Mixed activities"],
          suggestions: ["Continue engaging with the platform regularly"],
          recommendations: ["Explore new features and resources"]
        };
      }
    } else {
      // Use default analysis when OpenAI is not configured
      analysis = {
        engagementLevel: "Moderate",
        activePeriods: ["Various times"],
        preferredActivities: ["Mixed activities"],
        suggestions: ["Continue engaging with the platform regularly"],
        recommendations: ["Explore new features and resources"]
      };
    }
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing activity:', error);
    // Always return a safe fallback response instead of throwing errors
    res.json({ analysis: "Unable to analyze activity at this time. Please try again later." });
  }
});

// Helper function to check for achievements
async function checkAchievements(userId, action) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Define achievement criteria
    const achievements = await Achievement.find();
    
    for (const achievement of achievements) {
      let achieved = false;
      
      switch (achievement.criteria.type) {
        case 'upload_count':
          achieved = user.contributions >= achievement.criteria.value;
          break;
        case 'download_count':
          achieved = user.downloads >= achievement.criteria.value;
          break;
        case 'specific_action':
          achieved = action === achievement.criteria.value;
          break;
        case 'resource_rating':
          // This would require checking ratings, simplified for now
          achieved = false;
          break;
      }
      
      if (achieved && !user.badges.includes(achievement.name)) {
        // Award achievement
        user.badges.push(achievement.name);
        await user.save();
        
        // Create notification
        await Notification.create({
          userId: user._id,
          type: 'achievement_unlocked',
          message: `Congratulations! You've unlocked the "${achievement.name}" achievement.`,
          data: { achievementId: achievement._id }
        });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

export default router;