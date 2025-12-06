// backend/routes/activity.js - User Activity Logging Routes

const express = require('express');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const Activity = require('../models/Activity');
const { OpenAI } = require('openai');
require('dotenv').config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/activity/log
 * Log user activity and award credits
 * Body: { userId, activityType, content, metadata }
 */
router.post('/log', async (req, res) => {
  try {
    const { userId, activityType, content, metadata = {} } = req.body;
    
    if (!userId || !activityType) {
      return res.status(400).json({ error: 'userId and activityType required' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Store user's current credit balance
    const creditsBefore = user.credits;
    
    // Award credits based on activity type
    let creditsToAdd = 0;
    switch (activityType) {
      case 'upload':
        creditsToAdd = 100;
        break;
      case 'download':
        creditsToAdd = 20;
        break;
      case 'rating':
        creditsToAdd = 10;
        break;
      case 'review':
        creditsToAdd = 15;
        break;
      case 'story':
        creditsToAdd = 50;
        break;
      case 'circle_post':
        creditsToAdd = 25;
        break;
      case 'request_fulfilled':
        creditsToAdd = 75;
        break;
      default:
        creditsToAdd = 20;
    }

    // Update user credits
    user.credits += creditsToAdd;
    user.contributions += 1;
    
    // Calculate new credit balance
    const creditsAfter = user.credits;
    const creditsChange = creditsToAdd;
    
    // Generate tags based on content if provided
    let aiGeneratedTags = [];
    if (content) {
      try {
        const prompt = `Based on this user activity, generate 3-5 relevant tags that represent the user's interests:
Activity Type: ${activityType}
Content: ${content}
Metadata: ${JSON.stringify(metadata)}

Return the tags as a JSON array with the following format:
[
  "tag1",
  "tag2",
  "tag3"
]`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates relevant tags for user activities. Always respond with valid JSON array of tags."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 200,
        });

        const responseText = completion.choices[0].message.content;
        
        // Try to parse as JSON
        try {
          const aiTags = JSON.parse(responseText);
          aiGeneratedTags = aiTags;
          // Update user tags
          await user.updateTags(aiTags);
        } catch (parseError) {
          // If JSON parsing fails, try to extract from markdown code blocks
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            const aiTags = JSON.parse(jsonMatch[1]);
            aiGeneratedTags = aiTags;
            await user.updateTags(aiTags);
          }
        }
      } catch (error) {
        console.error('AI Tag Generation Error:', error);
      }
    }
    
    await user.save();

    // Create notifications for relevant activities
    await createActivityNotification(user, activityType, content, metadata);
    
    // Check and award achievements
    await checkAndAwardAchievements(user, activityType, metadata);
    
    // Log activity for audit purposes
    const activity = new Activity({
      userId: user._id,
      activityType,
      description: `User performed ${activityType} activity`,
      metadata: {
        ...metadata,
        aiGeneratedTags,
        contentPreview: content ? content.substring(0, 100) : null
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      creditsBefore,
      creditsAfter,
      creditsChange
    });
    
    await activity.save();

    res.status(200).json({
      message: `Activity logged successfully. ${creditsToAdd} credits awarded.`,
      credits: user.credits,
      contributions: user.contributions
    });
  } catch (error) {
    console.error('Activity Log Error:', error);
    res.status(500).json({ error: 'Server error logging activity' });
  }
});

/**
 * GET /api/activity/user/:userId
 * Get activity logs for a specific user
 * Query Params: page, limit, activityType
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, activityType } = req.query;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build query
    const query = { userId };
    if (activityType) {
      query.activityType = activityType;
    }
    
    // Get activities with pagination
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email');
    
    // Get total count
    const totalCount = await Activity.countDocuments(query);
    
    res.status(200).json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get Activities Error:', error);
    res.status(500).json({ error: 'Server error retrieving activities' });
  }
});

/**
 * GET /api/activity/stats/:userId
 * Get activity statistics for a user
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get activity counts by type
    const activityStats = await Activity.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalCredits: { $sum: '$creditsChange' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent activity trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyActivity = await Activity.aggregate([
      { 
        $match: { 
          userId: user._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          credits: { $sum: '$creditsChange' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      activityStats,
      dailyActivity
    });
  } catch (error) {
    console.error('Get Activity Stats Error:', error);
    res.status(500).json({ error: 'Server error retrieving activity stats' });
  }
});

/**
 * Create notification based on activity type
 */
async function createActivityNotification(user, activityType, content, metadata) {
  try {
    let notificationData = null;
    
    switch (activityType) {
      case 'upload':
        notificationData = {
          userId: user._id,
          type: 'resource',
          title: 'Resource Uploaded!',
          message: `Your resource "${metadata.title || 'Untitled'}" has been uploaded successfully.`,
          relatedId: metadata.resourceId,
          relatedType: 'resource',
          priority: 'medium'
        };
        break;
        
      case 'download':
        notificationData = {
          userId: user._id,
          type: 'resource',
          title: 'Resource Downloaded!',
          message: `You've downloaded "${metadata.title || 'a resource'}".`,
          relatedId: metadata.resourceId,
          relatedType: 'resource',
          priority: 'low'
        };
        break;
        
      case 'rating':
        notificationData = {
          userId: user._id,
          type: 'resource',
          title: 'Rating Submitted!',
          message: `Thank you for rating a resource. You've earned 10 credits!`,
          priority: 'low'
        };
        break;
        
      case 'review':
        notificationData = {
          userId: user._id,
          type: 'resource',
          title: 'Review Submitted!',
          message: `Thank you for reviewing a resource. You've earned 15 credits!`,
          priority: 'low'
        };
        break;
        
      case 'story':
        notificationData = {
          userId: user._id,
          type: 'system',
          title: 'Story Published!',
          message: `Your story has been published successfully.`,
          priority: 'medium'
        };
        break;
        
      case 'circle_post':
        notificationData = {
          userId: user._id,
          type: 'circle',
          title: 'Post Created!',
          message: `Your post in "${metadata.circleName || 'a study circle'}" has been published.`,
          relatedId: metadata.circleId,
          relatedType: 'circle',
          priority: 'low'
        };
        break;
        
      case 'request_fulfilled':
        notificationData = {
          userId: user._id,
          type: 'request',
          title: 'Request Fulfilled!',
          message: `Your request for "${metadata.requestTitle || 'a resource'}" has been fulfilled!`,
          relatedId: metadata.requestId,
          relatedType: 'request',
          priority: 'high'
        };
        break;
    }
    
    // Create notification if data exists
    if (notificationData) {
      const notification = new Notification(notificationData);
      await notification.save();
    }
  } catch (error) {
    console.error('Notification Creation Error:', error);
  }
}

/**
 * Check and award achievements based on user activity
 */
async function checkAndAwardAchievements(user, activityType, metadata) {
  try {
    // Define achievement criteria
    const achievementCriteria = {
      upload: { type: 'upload', count: user.contributions },
      download: { type: 'download', count: user.downloads || 0 },
      rating: { type: 'rating', count: user.ratings || 0 },
      review: { type: 'review', count: user.reviews || 0 }
    };
    
    // Check for specific achievements
    const achievementsToCheck = [];
    
    switch (activityType) {
      case 'upload':
        if (user.contributions === 1) {
          achievementsToCheck.push({
            type: 'upload',
            title: 'First Upload',
            description: 'Upload your first resource to the community',
            icon: '📤',
            points: 50,
            criteria: { uploads: 1 }
          });
        } else if (user.contributions === 10) {
          achievementsToCheck.push({
            type: 'upload',
            title: 'Uploader',
            description: 'Upload 10 resources to the community',
            icon: '📚',
            points: 100,
            criteria: { uploads: 10 }
          });
        } else if (user.contributions === 50) {
          achievementsToCheck.push({
            type: 'upload',
            title: 'Super Uploader',
            description: 'Upload 50 resources to the community',
            icon: '🚀',
            points: 250,
            criteria: { uploads: 50 }
          });
        }
        break;
        
      case 'download':
        // We would need to track downloads separately for this
        break;
        
      case 'rating':
        // We would need to track ratings separately for this
        break;
        
      case 'review':
        // We would need to track reviews separately for this
        break;
    }
    
    // Award achievements
    for (const achievementData of achievementsToCheck) {
      // Check if user already has this achievement
      const existingAchievement = await Achievement.findOne({
        userId: user._id,
        title: achievementData.title
      });
      
      if (!existingAchievement) {
        const achievement = new Achievement({
          userId: user._id,
          type: achievementData.type,
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon,
          points: achievementData.points,
          criteria: achievementData.criteria
        });
        
        await achievement.save();
        
        // Update user badges
        const badgeText = `${achievementData.icon} ${achievementData.title}`;
        if (!user.badges.includes(badgeText)) {
          user.badges.push(badgeText);
          await user.save();
        }
        
        // Create notification for achievement
        const notification = new Notification({
          userId: user._id,
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          message: `Congratulations! You've earned the "${achievementData.title}" achievement.`,
          priority: 'high'
        });
        await notification.save();
      }
    }
  } catch (error) {
    console.error('Achievement Check Error:', error);
  }
}

module.exports = router;