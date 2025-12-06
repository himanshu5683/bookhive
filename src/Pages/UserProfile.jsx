import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import AuthContext from '../auth/AuthContext';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResources, setUserResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.usersAPI.getAll({ limit: 10 });
        const fetchedUsers = response.users || [];
        setUsers(fetchedUsers);
        
        // If logged in, show current user profile first
        if (currentUser && currentUser.id) {
          const userResponse = await apiClient.usersAPI.getById(currentUser.id);
          setSelectedUser(userResponse.user);
        } else if (fetchedUsers.length > 0) {
          setSelectedUser(fetchedUsers[0]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load user profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Fetch user's resources when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      const fetchUserResources = async () => {
        try {
          const response = await apiClient.resourcesAPI.getAll({ authorId: selectedUser._id });
          setUserResources(response.resources || []);
        } catch (err) {
          console.error('Failed to fetch user resources:', err);
          setUserResources([]);
        }
      };
      fetchUserResources();
    }
  }, [selectedUser]);

  const handleFollow = async () => {
    if (!currentUser) {
      setError('Please log in to follow users');
      return;
    }

    try {
      await apiClient.usersAPI.follow(selectedUser._id);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Failed to follow user:', err);
      setError('Failed to update follow status.');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="user-profile-page">
        <div className="no-user">No user profile available.</div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">{selectedUser.avatar || '👤'}</div>
        <div className="profile-info">
          <h1>{selectedUser.name}</h1>
          <p className="profile-level">{selectedUser.role || 'Member'}</p>
          <p className="profile-bio">{selectedUser.bio || 'No bio yet'}</p>

          {currentUser && currentUser.id !== selectedUser._id && (
            <div className="profile-actions">
              <button
                className={`btn ${isFollowing ? 'btn-following' : 'btn-follow'}`}
                onClick={handleFollow}
              >
                {isFollowing ? '✓ Following' : 'Follow'}
              </button>
              <button className="btn btn-message">Message</button>
            </div>
          )}
        </div>
      </div>

      {/* Credits Display */}
      <div className="credits-section">
        <h3>💰 Credit Score</h3>
        <div className="credit-display">
          <div className="credit-card">
            <span className="credit-amount">{(selectedUser.credits || 0).toLocaleString()}</span>
            <span className="credit-label">Total Credits</span>
          </div>

          <div className="credit-breakdown">
            <div className="credit-item">
              <span className="credit-icon">📤</span>
              <p>From Uploads</p>
              <span className="credit-value">+{Math.floor((selectedUser.credits || 0) * 0.6)}</span>
            </div>
            <div className="credit-item">
              <span className="credit-icon">⭐</span>
              <p>From Ratings</p>
              <span className="credit-value">+{Math.floor((selectedUser.credits || 0) * 0.3)}</span>
            </div>
            <div className="credit-item">
              <span className="credit-icon">👥</span>
              <p>From Community</p>
              <span className="credit-value">+{Math.floor((selectedUser.credits || 0) * 0.1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{selectedUser.contributions || 0}</span>
          <span className="stat-label">Resources Shared</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{selectedUser.followers || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{selectedUser.following || 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      {/* Badges */}
      <div className="badges-section">
        <h3>🏅 Badges & Achievements</h3>
        <div className="badges-grid">
          {(selectedUser.badges || []).length > 0 ? (
            selectedUser.badges.map((badge, i) => (
              <div key={i} className="badge-item">
                <span className="badge-icon">⭐</span>
                <p>{badge}</p>
              </div>
            ))
          ) : (
            <p className="no-badges">No badges earned yet</p>
          )}
        </div>
      </div>

      {/* Contributed Resources */}
      <div className="contributed-resources">
        <h3>📚 Contributed Resources ({userResources.length})</h3>
        <div className="resources-list">
          {userResources.length > 0 ? (
            userResources.map(resource => (
              <div key={resource._id || resource.id} className="resource-item">
                <p className="resource-title">{resource.title}</p>
                <p className="resource-meta">
                  ⭐ {resource.rating || 0} • ⬇️ {(resource.downloads || 0).toLocaleString()} downloads
                </p>
              </div>
            ))
          ) : (
            <p className="no-resources">No resources contributed yet</p>
          )}
        </div>
      </div>

      {/* User Selector */}
      {users.length > 0 && (
        <div className="user-selector">
          <h3>View Other Profiles</h3>
          <div className="user-list">
            {users.map(user => (
              <button
                key={user._id || user.id}
                className={`user-btn ${selectedUser._id === user._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {user.avatar || '👤'} {user.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;