// backend/routes/users.js - User Management Routes

const express = require('express');

const router = express.Router();

// In-memory storage for development without database
const users = [
  {
    id: 'user1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    password: '$2a$10$examplehashedpassword', // 'password'
    credits: 1250,
    contributions: 42,
    followers: 156,
    following: 89,
    bio: 'Book lover and knowledge enthusiast',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    badges: ['Top Contributor', 'Knowledge Master', 'Leader'],
    joinDate: new Date('2023-01-15')
  },
  {
    id: 'user2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    password: '$2a$10$examplehashedpassword', // 'password'
    credits: 980,
    contributions: 35,
    followers: 98,
    following: 65,
    bio: 'Tech enthusiast and developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    badges: ['Rapid Riser', 'Active Member'],
    joinDate: new Date('2023-03-22')
  }
];

/**
 * GET /api/users
 * Fetch list of users with optional filtering
 * Query: ?page=1&limit=10&search=john
 */
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Filter users
    let filteredUsers = [...users];
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Paginate users
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      total: filteredUsers.length,
      users: paginatedUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        contributions: user.contributions,
        followers: user.followers,
        following: user.following,
        bio: user.bio,
        avatar: user.avatar,
        badges: user.badges,
        joinDate: user.joinDate
      })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total: filteredUsers.length }
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
router.get('/leaderboard', (req, res) => {
  try {
    const { sortBy = 'credits', page = 1, limit = 20 } = req.query;
    
    // Sort users
    const sortedUsers = [...users].sort((a, b) => {
      if (sortBy === 'credits') return b.credits - a.credits;
      if (sortBy === 'contributions') return b.contributions - a.contributions;
      if (sortBy === 'followers') return b.followers - a.followers;
      return b.credits - a.credits; // default to credits
    });
    
    // Paginate users
    const skip = (page - 1) * limit;
    const paginatedUsers = sortedUsers.slice(skip, skip + parseInt(limit));
    
    // Add rankings and medals
    const leaderboard = paginatedUsers.map((user, index) => {
      const rank = skip + index + 1;
      let medal = '';
      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';
      
      return {
        rank,
        medal,
        userId: user.id,
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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const user = users.find(user => user.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      contributions: user.contributions,
      followers: user.followers,
      following: user.following,
      bio: user.bio,
      avatar: user.avatar,
      badges: user.badges,
      joinDate: user.joinDate
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile
 * Body: { name, bio, avatar }
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, avatar } = req.body;
    
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user fields
    if (name) users[userIndex].name = name;
    if (bio !== undefined) users[userIndex].bio = bio;
    if (avatar) users[userIndex].avatar = avatar;
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        credits: users[userIndex].credits,
        contributions: users[userIndex].contributions,
        followers: users[userIndex].followers,
        following: users[userIndex].following,
        bio: users[userIndex].bio,
        avatar: users[userIndex].avatar,
        badges: users[userIndex].badges,
        joinDate: users[userIndex].joinDate
      }
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
router.put('/:id/credits', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, action = 'add', reason } = req.body;

    if (!amount || !['add', 'deduct'].includes(action)) {
      return res.status(400).json({ error: 'Invalid amount or action' });
    }

    // Find user
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update credits
    if (action === 'add') {
      users[userIndex].credits += amount;
    } else {
      users[userIndex].credits = Math.max(0, users[userIndex].credits - amount);
    }

    res.status(200).json({
      message: `Credits ${action}ed successfully`,
      userId: id,
      amount,
      action,
      reason,
      newCredits: users[userIndex].credits,
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
router.get('/:id/achievements', (req, res) => {
  try {
    const { id } = req.params;
    
    const user = users.find(user => user.id === id);
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
router.post('/:id/follow', (req, res) => {
  try {
    const { id } = req.params;
    const { followerId } = req.body;
    
    if (!followerId) {
      return res.status(400).json({ error: 'followerId required' });
    }
    
    // Find users
    const followedUserIndex = users.findIndex(user => user.id === id);
    const followerUserIndex = users.findIndex(user => user.id === followerId);
    
    if (followedUserIndex === -1 || followerUserIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update followed user's followers count
    users[followedUserIndex].followers += 1;
    
    // Update follower's following count
    users[followerUserIndex].following += 1;
    
    res.status(200).json({
      message: 'User followed successfully',
      userId: id,
      followerCount: users[followedUserIndex].followers
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Server error following user' });
  }
});

module.exports = router;
