// backend/routes/activity.js - User Activity Logging Routes

const express = require('express');
const User = require('../models/User.js');
const Resource = require('../models/Resource.js');
const Notification = require('../models/Notification.js');
const Achievement = require('../models/Achievement.js');
const Activity = require('../models/Activity.js');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/activity/log
 * Log user activity
 */
router.post('/log', async (req, res) => {
  try {
    const { userId, action, resourceId, metadata } = req.body;
    
    // Validate required fields
    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }
    
    // Create activity record
    const activity = new Activity({
      userId,
      action,
      resourceId,
      metadata
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
 * GET /api/activity/user/:userId
 * Get user activity history
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const activities = await Activity.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Activity.countDocuments({ userId: req.params.userId });
    
    res.json({ activities, total });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/activity/stats/:userId
 * Get user activity statistics
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get total activities
    const totalActivities = await Activity.countDocuments({ userId });
    
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
    const { userId, timeframe = 'month' } = req.body;
    
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
    let analysis;
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
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing activity:', error);
    res.status(500).json({ error: 'Failed to analyze activity' });
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

module.exports = router;
