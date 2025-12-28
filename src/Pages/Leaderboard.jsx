import React, { useState, useEffect } from 'react';
import { dashboardService, usersService } from '../services/api'; // Fixed: Import dashboardService instead of leaderboardService
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [filterBy, setFilterBy] = useState('credits');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gamification, setGamification] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch leaderboard and gamification data from backend API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch leaderboard
        const leaderboardResponse = await dashboardService.getLeaderboard({ sortBy: filterBy, limit: 20 }); // Fixed: Use dashboardService instead of leaderboardService
        // Fixed: Use response.leaderboard instead of trying response.users
        setUsers(leaderboardResponse.leaderboard || []);
        
        // Fetch gamification data
        try {
          const gamificationResponse = await usersService.getGamification();
          setGamification(gamificationResponse);
        } catch (gamificationErr) {
          console.error('Failed to fetch gamification data:', gamificationErr);
          // Don't set error for gamification as it's not critical for leaderboard display
          setGamification(null);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
              <div key={user.userId || user._id || user.id} className={`leaderboard-item rank-${idx + 1}`}>
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
          <h3>Your Achievements</h3>
          {gamification ? (
            <div className="achievement-grid">
              {gamification.badges && gamification.badges.map((badge, index) => (
                <div 
                  key={badge.key || index} 
                  className={`achievement-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => {
                    setSelectedBadge(badge);
                    setShowModal(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="achievement-icon">{badge.icon}</span>
                  <p>{badge.title}</p>
                  {badge.unlocked && <span className="unlocked-indicator">✓</span>}
                </div>
              ))}
            </div>
          ) : (
            <p>Loading achievements...</p>
          )}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {showModal && selectedBadge && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">{selectedBadge.icon}</span>
              <h3>{selectedBadge.title}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedBadge.description}</p>
              <div className="modal-status">
                Status: <span className={selectedBadge.unlocked ? 'status-unlocked' : 'status-locked'}>
                  {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;