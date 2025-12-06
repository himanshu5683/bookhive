import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [filterBy, setFilterBy] = useState('credits');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leaderboard from backend API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.usersAPI.getLeaderboard({ sortBy: filterBy, limit: 20 });
        setUsers(response.leaderboard || response.users || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
        setUsers([]);
      } finally {
        setLoading(false);
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

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="filter-group">
          <label>Rank By:</label>
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} disabled={loading}>
            <option value="credits">Credits</option>
            <option value="contributions">Contributions</option>
            <option value="followers">Followers</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading leaderboard...</p>
        </div>
      )}

      {/* Rankings */}
      {!loading && (
        <div className="leaderboard-list">
          {rankedUsers.length === 0 ? (
            <div className="no-users">
              <p>No users on the leaderboard yet.</p>
            </div>
          ) : (
            rankedUsers.map((user, idx) => (
              <div key={user._id || user.id} className={`leaderboard-item rank-${idx + 1}`}>
                <div className="rank-medal">{getMedalEmoji(idx + 1)}</div>

                <div className="user-info">
                  <span className="user-avatar">{user.avatar || '👤'}</span>
                  <div className="user-details">
                    <p className="user-name">{user.name}</p>
                    <p className="user-level">{user.role || 'Member'}</p>
                  </div>
                </div>

                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-label">💰 Credits</span>
                    <span className="stat-value">{(user.credits || 0).toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">📤 Contributions</span>
                    <span className="stat-value">{user.contributions || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">👥 Followers</span>
                    <span className="stat-value">{user.followers || 0}</span>
                  </div>
                </div>

                <div className="user-badges">
                  {(user.badges || []).slice(0, 3).map((badge, i) => (
                    <span key={i} className="badge" title={badge}>{badge}</span>
                  ))}
                  {(user.tags || []).slice(0, 2).map((tag, i) => (
                    <span key={`tag-${i}`} className="badge" title={tag}>#{tag}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
