// backend/routes/users.js - User Management Routes

const express = require('express');
const User = require('../models/User');

const router = express.Router();

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
 * PUT /api/users/:id
 * Update user profile
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
 * GET /api/users/:id/achievements
 * Fetch user badges and achievements
 */
router.get('/:id/achievements', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('badges');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Sample badges (in a real app, these would be dynamically determined)
    const badges = [
      {
        name: 'Top Contributor',
        description: 'Uploaded 10+ quality resources',
        icon: '🏆',
        unlocked: user.badges.includes('Top Contributor'),
        unlockedDate: new Date('2023-06-15')
      },
      {
        name: 'Rapid Riser',
        description: 'Gained 500+ credits in 30 days',
        icon: '📈',
        unlocked: user.badges.includes('Rapid Riser'),
        unlockedDate: new Date('2023-08-20')
      },
      {
        name: '7-Day Streak',
        description: 'Logged in 7 days consecutively',
        icon: '🔥',
        unlocked: user.badges.includes('7-Day Streak'),
        progress: 5
      }
    ];
    
    res.status(200).json({ badges });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Server error fetching achievements' });
  }
});

/**
 * POST /api/users/:id/follow
 * Follow a user
 * Body: { followerId }
 */
router.post('/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { followerId } = req.body;
    
    if (!followerId) {
      return res.status(400).json({ error: 'followerId required' });
    }
    
    // Update followed user's followers count
    const followedUser = await User.findByIdAndUpdate(id, {
      $inc: { followers: 1 }
    }, { new: true });
    
    if (!followedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update follower's following count
    await User.findByIdAndUpdate(followerId, {
      $inc: { following: 1 }
    });
    
    res.status(200).json({
      message: 'User followed successfully',
      userId: id,
      followerCount: followedUser.followers
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Server error following user' });
  }
});

/**
 * PUT /api/users/:id/tags
 * Update user tags based on activity
 * Body: { tags }
 */
router.put('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array required' });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update tags
    await user.updateTags(tags);

    res.status(200).json({
      message: 'Tags updated successfully',
      userId: id,
      tags: user.tags
    });
  } catch (error) {
    console.error('Error updating user tags:', error);
    res.status(500).json({ error: 'Server error updating user tags' });
  }
});

/**
 * PUT /api/users/:id/tags
 * Update user tags based on activity
 * Body: { tags }
 */
router.put('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array required' });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update tags
    await user.updateTags(tags);

    res.status(200).json({
      message: 'Tags updated successfully',
      userId: id,
      tags: user.tags
    });
  } catch (error) {
    console.error('Error updating user tags:', error);
    res.status(500).json({ error: 'Server error updating user tags' });
  }
});

module.exports = router;
