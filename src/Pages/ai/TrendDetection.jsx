import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const TrendDetection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState([]);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await apiClient.aiAPI.trendDetection({
        timeRange,
        category,
        userId: user?.id
      });
      
      setTrends(response.trends || []);
      setInsights(response.insights || []);
    } catch (err) {
      console.error("Trend detection error:", err);
      setError("Failed to fetch trends. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [timeRange, category, user]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
  };

  const getTrendChangeClass = (change) => {
    if (change > 0) return "positive";
    if (change < 0) return "negative";
    return "neutral";
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>📈 AI Trend Detection</h1>
        <p>Discover trending topics and resources in your community</p>
      </div>

      <div className="trend-controls card">
        <div className="filter-section">
          <h3>Filter Trends</h3>
          <div className="filter-options">
            <div className="filter-group">
              <label>Time Range:</label>
              <div className="button-group">
                <button 
                  className={`btn ${timeRange === "day" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleTimeRangeChange("day")}
                >
                  Today
                </button>
                <button 
                  className={`btn ${timeRange === "week" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleTimeRangeChange("week")}
                >
                  This Week
                </button>
                <button 
                  className={`btn ${timeRange === "month" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleTimeRangeChange("month")}
                >
                  This Month
                </button>
                <button 
                  className={`btn ${timeRange === "year" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleTimeRangeChange("year")}
                >
                  This Year
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select 
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option value="all">All Categories</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="history">History</option>
                <option value="biography">Biography</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing trends with AI...</p>
        </div>
      ) : (
        <div className="trend-content">
          <div className="trends-section">
            <h2>Trending Topics</h2>
            {trends.length > 0 ? (
              <div className="trends-grid">
                {trends.map((trend, index) => (
                  <div key={index} className="trend-card card">
                    <div className="trend-header">
                      <h3 className="trend-title">{trend.topic}</h3>
                      <div className={`trend-change ${getTrendChangeClass(trend.change)}`}>
                        {trend.change > 0 ? "↗" : trend.change < 0 ? "↘" : "→"} {Math.abs(trend.change)}%
                      </div>
                    </div>
                    <div className="trend-stats">
                      <div className="stat">
                        <span className="stat-label">Resources:</span>
                        <span className="stat-value">{trend.resourceCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Views:</span>
                        <span className="stat-value">{trend.viewCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Discussions:</span>
                        <span className="stat-value">{trend.discussionCount}</span>
                      </div>
                    </div>
                    <div className="trend-category">
                      Category: <span className="badge badge-secondary">{trend.category}</span>
                    </div>
                    {trend.description && (
                      <p className="trend-description">{trend.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">📊</div>
                <h3>No trends found</h3>
                <p>Try adjusting your filters or check back later for new trends</p>
              </div>
            )}
          </div>

          {insights.length > 0 && (
            <div className="insights-section card">
              <h2>AI Insights</h2>
              <div className="insights-list">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-icon">💡</div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back to AI Dashboard */}
      <div className="back-to-dashboard">
        <button 
          className="btn btn-outline"
          onClick={() => navigate("/ai")}
        >
          ← Back to AI Dashboard
        </button>
      </div>
    </div>
  );
};

export default TrendDetection;