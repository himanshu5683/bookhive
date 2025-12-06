import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import useResources from "../hooks/useResources";
import useUserActivity from "../hooks/useUserActivity";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const { resources: recentUploads, fetchResources } = useResources();
  const { stats, fetchUserStats } = useUserActivity(user?.id);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch all dashboard data
    const fetchData = async () => {
      try {
        // Fetch user stats using our hook
        await fetchUserStats();

        // Fetch recent uploads using our hook
        fetchResources({ authorId: user.id, sort: 'recent', limit: 5 });

        // Fetch AI recommendations
        const recommendationsResponse = await apiClient.aiAPI.getRecommendations({
          userId: user.id
        });
        setRecommendedResources(recommendationsResponse.recommendations || []);

        // Fetch leaderboard position
        const leaderboardResponse = await apiClient.usersAPI.getLeaderboard();
        if (leaderboardResponse.users) {
          const position = leaderboardResponse.users.findIndex(u => u._id === user.id);
          setLeaderboardPosition(position >= 0 ? position + 1 : null);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, fetchResources, fetchUserStats]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to logout. Please try again.");
      console.error("Logout error:", err);
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">👋 Welcome back, {user?.name || 'User'}!</h1>
            <p className="dashboard-subtitle">Your personalized learning hub</p>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            disabled={signingOut}
          >
            {signingOut ? "Signing Out..." : "🚪 Logout"}
          </button>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="section-title">📊 Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-content">
                <div className="stat-value">{stats.contributions}</div>
                <div className="stat-label">Files Uploaded</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">{stats.credits}</div>
                <div className="stat-label">Credits Earned</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-value">{stats.ratings}</div>
                <div className="stat-label">Ratings Given</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{leaderboardPosition ? `#${leaderboardPosition}` : 'N/A'}</div>
                <div className="stat-label">Leaderboard Rank</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Simplified Visualization */}
        <div className="charts-section">
          <h2 className="section-title">📈 Activity Trends</h2>
          <div className="chart-placeholder">
            <div className="chart-info">
              <h3>Weekly Activity</h3>
              <p>Track your learning progress over time</p>
            </div>
            <div className="chart-visualization">
              {[10, 25, 40, 30, 55, 45, 60].map((height, index) => (
                <div 
                  key={index} 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                >
                  <span className="bar-value">{height}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="uploads-section">
          <div className="section-header">
            <h2 className="section-title">📤 Recent Uploads</h2>
            <button 
              className="view-all-btn" 
              onClick={() => navigate("/files")}
            >
              View All
            </button>
          </div>
          {recentUploads.length > 0 ? (
            <div className="resources-grid">
              {recentUploads.map(resource => (
                <div key={resource._id} className="resource-card small">
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-meta">
                    <span className="resource-category">{resource.category}</span>
                    <span className="resource-date">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <div className="resource-stats">
                    <span>⬇️ {resource.downloads || 0}</span>
                    <span>⭐ {resource.rating || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>You haven't uploaded any resources yet.</p>
              <button 
                className="action-btn primary"
                onClick={() => navigate("/upload")}
              >
                Upload Your First Resource
              </button>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="recommendations-section">
          <h2 className="section-title">🤖 Personalized Recommendations</h2>
          {recommendedResources.length > 0 ? (
            <div className="resources-grid">
              {recommendedResources.slice(0, 3).map((book, index) => (
                <div key={index} className="resource-card">
                  <h3 className="resource-title">{book.title}</h3>
                  <p className="resource-author">by {book.author}</p>
                  <p className="resource-description">{book.description}</p>
                  <div className="resource-meta">
                    <span className="resource-genre">{book.genre}</span>
                  </div>
                  {book.reasoning && (
                    <div className="recommendation-reasoning">
                      <p><strong>Why this recommendation:</strong> {book.reasoning}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>We couldn't generate personalized recommendations for you yet. Upload some resources to get started!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2 className="section-title">🎯 Quick Actions</h2>
          <div className="actions-grid">
            <button
              className="action-btn primary"
              onClick={() => navigate("/upload")}
            >
              <span className="action-icon">📤</span>
              <span className="action-text">Upload Files</span>
              <span className="action-desc">Add new files to the community</span>
            </button>
            <button
              className="action-btn secondary"
              onClick={() => navigate("/files")}
            >
              <span className="action-icon">📚</span>
              <span className="action-text">View All Files</span>
              <span className="action-desc">Browse community uploads</span>
            </button>
            <button
              className="action-btn tertiary"
              onClick={() => navigate("/ai/recommendations")}
            >
              <span className="action-icon">🤖</span>
              <span className="action-text">Get Recommendations</span>
              <span className="action-desc">Find personalized resources</span>
            </button>
            <button
              className="action-btn quaternary"
              onClick={() => navigate("/leaderboard")}
            >
              <span className="action-icon">🏆</span>
              <span className="action-text">View Leaderboard</span>
              <span className="action-desc">See top contributors</span>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="info-box">
          <h3>💡 Tips for Success</h3>
          <ul>
            <li>Upload quality educational resources to earn more credits</li>
            <li>Engage with the community by rating and reviewing resources</li>
            <li>Join study circles to collaborate with like-minded learners</li>
            <li>Check your personalized recommendations regularly for new content</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;