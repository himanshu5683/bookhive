import React, { useState, useEffect } from 'react';
import { sampleUsers, sampleNotes } from '../data/sampleData';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const [selectedUser, setSelectedUser] = useState(sampleUsers[0]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users from API or use sample data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // TODO: Uncomment when backend is ready
        // const data = await usersAPI.getAll();
        // setUsers(data.users);
        
        // For now, use sample data
        setUsers(sampleUsers);
        setSelectedUser(sampleUsers[0]);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        // Fallback to sample data
        setUsers(sampleUsers);
        setSelectedUser(sampleUsers[0]);
      }
    };

    fetchUsers();
  }, []);

  const userNotes = sampleNotes.filter(note => note.authorId === selectedUser.id);

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">{selectedUser.avatar}</div>
        <div className="profile-info">
          <h1>{selectedUser.name}</h1>
          <p className="profile-level">{selectedUser.level}</p>
          <p className="profile-bio">{selectedUser.bio}</p>

          <div className="profile-actions">
            <button
              className={`btn ${isFollowing ? 'btn-following' : 'btn-follow'}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? '✓ Following' : 'Follow'}
            </button>
            <button className="btn btn-message">Message</button>
          </div>
        </div>
      </div>

      {/* Credits Display */}
      <div className="credits-section">
        <h3>💰 Credit Score</h3>
        <div className="credit-display">
          <div className="credit-card">
            <span className="credit-amount">{selectedUser.credits.toLocaleString()}</span>
            <span className="credit-label">Total Credits</span>
          </div>

          <div className="credit-breakdown">
            <div className="credit-item">
              <span className="credit-icon">📤</span>
              <p>From Uploads</p>
              <span className="credit-value">+{Math.floor(selectedUser.credits * 0.6)}</span>
            </div>
            <div className="credit-item">
              <span className="credit-icon">⭐</span>
              <p>From Ratings</p>
              <span className="credit-value">+{Math.floor(selectedUser.credits * 0.3)}</span>
            </div>
            <div className="credit-item">
              <span className="credit-icon">👥</span>
              <p>From Community</p>
              <span className="credit-value">+{Math.floor(selectedUser.credits * 0.1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{selectedUser.contributions}</span>
          <span className="stat-label">Resources Shared</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{selectedUser.followers}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{selectedUser.following}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      {/* Badges */}
      <div className="badges-section">
        <h3>🏅 Badges & Achievements</h3>
        <div className="badges-grid">
          {selectedUser.badges.map((badge, i) => (
            <div key={i} className="badge-item">
              <span className="badge-icon">⭐</span>
              <p>{badge}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contributed Resources */}
      <div className="contributed-resources">
        <h3>📚 Contributed Resources ({userNotes.length})</h3>
        <div className="resources-list">
          {userNotes.map(note => (
            <div key={note.id} className="resource-item">
              <p className="resource-title">{note.emoji} {note.title}</p>
              <p className="resource-meta">
                ⭐ {note.rating} • ⬇️ {note.downloads.toLocaleString()} downloads
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* User Selector */}
      <div className="user-selector">
        <h3>View Other Profiles</h3>
        <div className="user-list">
          {sampleUsers.map(user => (
            <button
              key={user.id}
              className={`user-btn ${selectedUser.id === user.id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              {user.avatar} {user.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
