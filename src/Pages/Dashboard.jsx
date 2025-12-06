import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ files: 0, credits: 0, contributions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user stats from backend
    const fetchStats = async () => {
      try {
        // Try to get user data from API
        if (user.id) {
          const response = await apiClient.usersAPI.getById(user.id);
          if (response.user) {
            setStats({
              files: response.user.contributions || 0,
              credits: response.user.credits || 0,
              contributions: response.user.contributions || 0
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        // Use default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

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
            <h1 className="dashboard-title">👋 Welcome to BookHive</h1>
            <p className="dashboard-subtitle">Manage your files and uploads</p>
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

        <div className="user-section">
          <h2 className="section-title">📧 Account Information</h2>
          <div className="user-info">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value info-mono">{user?.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user?.name || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <h2 className="section-title">📊 Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-content">
                <div className="stat-value">{stats.files}</div>
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
                <div className="stat-value">{stats.contributions}</div>
                <div className="stat-label">Contributions</div>
              </div>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        <div className="info-box">
          <h3>💡 Tips</h3>
          <ul>
            <li>Upload educational files like PDFs, images, and videos</li>
            <li>Your email will be visible to users who download your files</li>
            <li>Files are listed newest first in the community</li>
            <li>Maximum file size is 100MB per upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
