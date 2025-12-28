// backend/routes/users.js - User Management Routes

import express from 'express';
import User from '../models/User.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes except public ones
router.use(authenticate);

/**
 * GET /api/users
 * Fetch list of users with optional filtering
 * Query: ?page=1&limit=10&search=john
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      total,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

/**
 * GET /api/users/leaderboard
 * Fetch leaderboard rankings
 * Query: ?sortBy=credits&page=1&limit=20
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { sortBy = 'credits', page = 1, limit = 20 } = req.query;
    
    // Build sort
    const sortObj = {};
    if (sortBy === 'credits') sortObj.credits = -1;
    else if (sortBy === 'contributions') sortObj.contributions = -1;
    else if (sortBy === 'followers') sortObj.followers = -1;
    else sortObj.credits = -1;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const users = await User.find()
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add rankings and medals
    const leaderboard = users.map((user, index) => {
      const rank = skip + index + 1;
      let medal = '';
      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';
      
      return {
        rank,
        medal,
        userId: user._id,
        name: user.name,
        credits: user.credits,
        contributions: user.contributions,
        followers: user.followers
      };
    });
    
    res.status(200).json({
      leaderboard,
      pagination: { page: parseInt(page), limit: parseInt(limit), sortBy }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

/**
 * GET /api/users/profile
 * Fetch current user's profile details
 */
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

/**
 * GET /api/users/:id
 * Fetch user profile details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 * Body: { name, bio, avatar, tags }
 */
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    const { name, bio, avatar, tags } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;
    if (tags && Array.isArray(tags)) updateFields.tags = tags;
    
    const user = await User.findByIdAndUpdate(userId, updateFields, { 
      new: true,
      select: '-password'
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile (admin only in production)
 * Body: { name, bio, avatar, tags }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, avatar, tags } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;
    if (tags && Array.isArray(tags)) updateFields.tags = tags;
    
    const user = await User.findByIdAndUpdate(id, updateFields, { 
      new: true,
      select: '-password'
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

/**
 * PUT /api/users/:id/credits
 * Update user credits
 * Body: { amount, action: 'add'|'deduct', reason }
 */
router.put('/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, action = 'add', reason } = req.body;

    if (!amount || !['add', 'deduct'].includes(action)) {
      return res.status(400).json({ error: 'Invalid amount or action' });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update credits
    if (action === 'add') {
      user.credits += amount;
    } else {
      user.credits = Math.max(0, user.credits - amount);
    }

    await user.save();

    res.status(200).json({
      message: `Credits ${action}ed successfully`,
      userId: id,
      amount,
      action,
      reason,
      newCredits: user.credits,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    res.status(500).json({ error: 'Server error updating credits' });
  }
});

/**
 * GET /api/users/gamification
 * Fetch current user's gamification status and badges
 */
router.get('/gamification', async (req, res) => {
  try {
    const userId = req.user.id; // Using id from authenticated user (as requested)
    
    // Find user and get their stats
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate dynamic badges based on user stats
    const unlockedBadges = [];
    const lockedBadges = [];

    // Define badge criteria
    const badgeCriteria = [
      {
        key: 'topContributor',
        title: 'Top Contributor',
        description: 'Upload 10 resources to the community',
        icon: '⭐',
        unlocked: user.contributions >= 10
      },
      {
        key: 'rapidRiser',
        title: 'Rapid Riser',
        description: 'Accumulate 200 points/credits',
        icon: '🚀',
        unlocked: user.credits >= 200
      },
      {
        key: 'sevenDayStreak',
        title: '7-Day Streak',
        description: 'Maintain activity for 7 consecutive days',
        icon: '🔥',
        unlocked: false // Placeholder - would need actual streak tracking
      },
      {
        key: 'premiumMember',
        title: 'Premium Member',
        description: 'Upgrade to premium membership',
        icon: '💎',
        unlocked: false // Placeholder - would need actual premium status
      },
      {
        key: 'knowledgeMaster',
        title: 'Knowledge Master',
        description: 'Upload 25 resources to the community',
        icon: '📚',
        unlocked: user.contributions >= 25
      },
      {
        key: 'communityLeader',
        title: 'Community Leader',
        description: 'Create or lead community circles',
        icon: '👑',
        unlocked: false // Placeholder - would need actual role data
      }
    ];

    // Categorize badges as unlocked/locked and update user badges if needed
    badgeCriteria.forEach(badge => {
      const badgeText = `${badge.icon} ${badge.title}`;
      if (badge.unlocked) {
        // Add to unlocked badges list
        unlockedBadges.push(badge);
        // Add to user's badges if not already there
        if (!user.badges.includes(badgeText)) {
          user.badges.push(badgeText);
        }
      } else {
        lockedBadges.push(badge);
      }
    });

    // Update user badges if new badges were unlocked
    if (unlockedBadges.some(badge => !user.badges.includes(`${badge.icon} ${badge.title}`))) {
      await user.save();
    }

    res.status(200).json({
      points: user.credits,
      level: Math.floor(user.credits / 100) + 1, // Example level calculation
      streak: 0, // Placeholder - would need actual streak tracking
      badges: [...unlockedBadges, ...lockedBadges],
      stats: {
        uploads: user.contributions,
        likes: 0, // Would need to track likes received
        comments: 0, // Would need to track comments made
        downloads: user.downloads
      },
      premium: false, // Placeholder - would need actual premium status
      role: user.role || 'Member'
    });
  } catch (error) {
    console.error('Error fetching gamification status:', error);
    res.status(500).json({ error: 'Server error fetching gamification status' });
  }
});

export default router;