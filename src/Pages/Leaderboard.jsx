import React, { useState, useEffect } from 'react';
import { sampleUsers } from '../data/sampleData';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [filterBy, setFilterBy] = useState('credits');
  const [users, setUsers] = useState([]);

  // Fetch leaderboard from API or use sample data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // TODO: Uncomment when backend is ready
        // const data = await usersAPI.getLeaderboard({ sortBy: filterBy });
        // setUsers(data.leaderboard);
        
        // For now, use sample data
        setUsers(sampleUsers);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        // Fallback to sample data
        setUsers(sampleUsers);
      }
    };

    fetchLeaderboard();
  }, [filterBy]);

  const rankedUsers = [...users].sort((a, b) => {
    if (filterBy === 'credits') return b.credits - a.credits;
    if (filterBy === 'contributions') return b.contributions - a.contributions;
    if (filterBy === 'followers') return b.followers - a.followers;
    return 0;
  });

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <div className="leaderboard-page">
      {/* Hero */}
      <div className="leaderboard-hero">
        <h1>🏆 Leaderboard</h1>
        <p>Top contributors and community leaders</p>
      </div>

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="filter-group">
          <label>Rank By:</label>
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="credits">Credits</option>
            <option value="contributions">Contributions</option>
            <option value="followers">Followers</option>
          </select>
        </div>
      </div>

      {/* Rankings */}
      <div className="leaderboard-list">
        {rankedUsers.map((user, idx) => (
          <div key={user.id} className={`leaderboard-item rank-${idx + 1}`}>
            <div className="rank-medal">{getMedalEmoji(idx + 1)}</div>

            <div className="user-info">
              <span className="user-avatar">{user.avatar}</span>
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <p className="user-level">{user.level}</p>
              </div>
            </div>

            <div className="user-stats">
              <div className="stat">
                <span className="stat-label">Credits</span>
                <span className="stat-value">{user.credits.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Contributions</span>
                <span className="stat-value">{user.contributions}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Followers</span>
                <span className="stat-value">{user.followers}</span>
              </div>
            </div>

            <div className="user-badges">
              {user.badges.map((badge, i) => (
                <span key={i} className="badge" title={badge}>{badge}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Gamification Section */}
      <div className="gamification-section">
        <h2>🎮 Gamification</h2>

        <div className="achievements">
          <h3>Recent Achievements</h3>
          <div className="achievement-grid">
            <div className="achievement-item">
              <span className="achievement-icon">⭐</span>
              <p>Top Contributor</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🚀</span>
              <p>Rapid Riser</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">🔥</span>
              <p>7-Day Streak</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">💎</span>
              <p>Premium Member</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">📚</span>
              <p>Knowledge Master</p>
            </div>
            <div className="achievement-item">
              <span className="achievement-icon">👑</span>
              <p>Community Leader</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
