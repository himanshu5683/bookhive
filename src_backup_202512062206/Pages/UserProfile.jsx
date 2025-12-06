import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import useResources from "../hooks/useResources";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { userId } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: ""
  });
  const [error, setError] = useState("");
  const { resources: userResources, fetchResources } = useResources();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Determine which user to fetch
        const targetUserId = userId || currentUser?.id;
        
        if (!targetUserId) {
          throw new Error("No user specified");
        }
        
        // Fetch user data
        const userResponse = await apiClient.usersAPI.getById(targetUserId);
        const userData = userResponse.user || userResponse;
        
        setSelectedUser(userData);
        setFormData({
          name: userData.name || "",
          bio: userData.bio || "",
          avatar: userData.avatar || ""
        });
        
        // Fetch user's resources using our hook
        fetchResources({ authorId: targetUserId });
        
        // Fetch user's achievements
        const achievementsResponse = await apiClient.achievementsAPI.getUserAchievements(targetUserId);
        setUserAchievements(achievementsResponse.achievements || []);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError("Failed to load user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser, fetchResources]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: selectedUser?.name || "",
      bio: selectedUser?.bio || "",
      avatar: selectedUser?.avatar || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      const updateData = {};
      if (formData.name !== selectedUser.name) updateData.name = formData.name;
      if (formData.bio !== selectedUser.bio) updateData.bio = formData.bio;
      if (formData.avatar !== selectedUser.avatar) updateData.avatar = formData.avatar;
      
      const response = await apiClient.usersAPI.update(selectedUser._id || selectedUser.id, updateData);
      
      setSelectedUser(response.user);
      setEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">User not found</div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && (selectedUser._id === currentUser.id || selectedUser.id === currentUser.id);

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} alt={selectedUser.name} />
            ) : (
              <div className="avatar-placeholder">
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="edit-name-input"
              />
            ) : (
              <h1 className="profile-name">{selectedUser.name || "Unnamed User"}</h1>
            )}
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{selectedUser.contributions || 0}</span>
                <span className="stat-label">Contributions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{selectedUser.credits || 0}</span>
                <span className="stat-label">Credits</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userResources.length}</span>
                <span className="stat-label">Resources</span>
              </div>
            </div>
            
            {editing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="edit-bio-textarea"
                maxLength={500}
              />
            ) : (
              <p className="profile-bio">
                {selectedUser.bio || "No bio available"}
              </p>
            )}
          </div>
          
          {isOwnProfile && !editing && (
            <button className="edit-profile-btn" onClick={handleEdit}>
              Edit Profile
            </button>
          )}
        </div>

        {editing && (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSubmit}>
              Save Changes
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}

        {/* User Tags */}
        {selectedUser.tags && selectedUser.tags.length > 0 && (
          <div className="tags-section">
            <h3>🏷️ Interests</h3>
            <div className="tags-container">
              {selectedUser.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements & Badges */}
        <div className="badges-section">
          <h3>🏅 Achievements & Badges</h3>
          {userAchievements.length > 0 ? (
            <div className="achievements-grid">
              {userAchievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <span className="achievement-icon">{achievement.icon || '🏆'}</span>
                  <div className="achievement-content">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                    {achievement.points > 0 && (
                      <span className="achievement-points">+{achievement.points} points</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : selectedUser.badges && selectedUser.badges.length > 0 ? (
            <div className="badges-grid">
              {selectedUser.badges.map((badge, i) => (
                <div key={i} className="badge-item">
                  <span className="badge-icon">⭐</span>
                  <p>{badge}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-badges">No achievements or badges earned yet</p>
          )}
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
                  <div className="resource-tags">
                    {resource.tags && resource.tags.map((tag, index) => (
                      <span key={index} className="resource-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No resources contributed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;