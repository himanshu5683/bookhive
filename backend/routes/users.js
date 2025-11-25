// backend/routes/users.js - User Management Routes

const express = require('express');
const router = express.Router();

/**
 * GET /api/users
 * Fetch list of users with optional filtering
 * Query: ?page=1&limit=10&search=john
 */
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  // TODO: Query database
  // TODO: Filter by search term if provided
  // TODO: Paginate results

  res.status(200).json({
    total: 5,
    users: [
      {
        id: 'user1',
        name: 'Alice Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        credits: 1250,
        contributions: 42,
      },
    ],
    pagination: { page: 1, limit: 10, total: 5 },
  });
});

/**
 * GET /api/users/leaderboard
 * Fetch leaderboard rankings
 * Query: ?sortBy=credits&page=1&limit=20
 */
router.get('/leaderboard', (req, res) => {
  const { sortBy = 'credits', page = 1, limit = 20 } = req.query;

  // TODO: Query database
  // TODO: Sort by credits, contributions, or followers based on sortBy
  // TODO: Rank users and assign medals (🥇 top 3)

  res.status(200).json({
    leaderboard: [
      {
        rank: 1,
        medal: '🥇',
        userId: 'user1',
        name: 'Alice Chen',
        credits: 1250,
        contributions: 42,
        followers: 156,
      },
      {
        rank: 2,
        medal: '🥈',
        userId: 'user2',
        name: 'Bob Williams',
        credits: 980,
        contributions: 35,
        followers: 98,
      },
      {
        rank: 3,
        medal: '🥉',
        userId: 'user3',
        name: 'Carol Martinez',
        credits: 850,
        contributions: 28,
        followers: 72,
      },
    ],
    pagination: { page: 1, limit: 20, sortBy: 'credits' },
  });
});

/**
 * GET /api/users/:id
 * Fetch user profile details
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // TODO: Query database
  // TODO: Include credits, contributions, badges, followers
  // TODO: Include contributed resources

  res.status(200).json({
    id,
    name: 'Alice Chen',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    bio: 'Book lover and knowledge enthusiast',
    credits: 1250,
    creditsBreakdown: {
      uploads: 500,
      ratings: 300,
      community: 450,
    },
    badges: ['Top Contributor', 'Knowledge Master', 'Leader'],
    contributions: 42,
    followers: 156,
    joinDate: new Date('2023-01-15'),
    contributedResources: [
      {
        id: 'res1',
        title: 'Advanced React Patterns',
        type: 'PDF',
        rating: 4.8,
      },
    ],
  });
});

/**
 * PUT /api/users/:id
 * Update user profile
 * Body: { name, bio, avatar }
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, bio, avatar } = req.body;

  // TODO: Verify authentication (only user can edit own profile)
  // TODO: Update database

  res.status(200).json({
    message: 'Profile updated successfully',
    user: {
      id,
      name,
      bio,
      avatar,
    },
  });
});

/**
 * PUT /api/users/:id/credits
 * Update user credits
 * Body: { amount, action: 'add'|'deduct', reason }
 */
router.put('/:id/credits', (req, res) => {
  const { id } = req.params;
  const { amount, action = 'add', reason } = req.body;

  if (!amount || !['add', 'deduct'].includes(action)) {
    return res.status(400).json({ error: 'Invalid amount or action' });
  }

  // TODO: Verify authentication (only admin/system can modify)
  // TODO: Update credits in database
  // TODO: Log credit transaction

  const newCredits = action === 'add' ? 1250 + amount : 1250 - amount;

  res.status(200).json({
    message: `Credits ${action}ed successfully`,
    userId: id,
    amount,
    action,
    reason,
    newCredits,
    timestamp: new Date(),
  });
});

/**
 * GET /api/users/:id/achievements
 * Fetch user badges and achievements
 */
router.get('/:id/achievements', (req, res) => {
  const { id } = req.params;

  // TODO: Query database
  // TODO: Include achievement dates and progress

  res.status(200).json({
    badges: [
      {
        name: 'Top Contributor',
        description: 'Uploaded 10+ quality resources',
        icon: '🏆',
        unlocked: true,
        unlockedDate: new Date('2023-06-15'),
      },
      {
        name: 'Rapid Riser',
        description: 'Gained 500+ credits in 30 days',
        icon: '📈',
        unlocked: true,
        unlockedDate: new Date('2023-08-20'),
      },
      {
        name: '7-Day Streak',
        description: 'Logged in 7 days consecutively',
        icon: '🔥',
        unlocked: false,
        progress: 5,
      },
    ],
  });
});

/**
 * POST /api/users/:id/follow
 * Follow a user
 * Body: { followerId }
 */
router.post('/:id/follow', (req, res) => {
  const { id } = req.params;
  const { followerId } = req.body;

  // TODO: Check if already following
  // TODO: Add to followers list in database

  res.status(200).json({
    message: 'User followed successfully',
    userId: id,
    followerCount: 157,
  });
});

module.exports = router;
