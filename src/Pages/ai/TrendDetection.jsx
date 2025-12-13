import React, { useState, useContext, useCallback, useEffect } from "react"; // Fixed: Add missing imports
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { aiService } from "../../services/api"; // Fixed: Import aiService instead of apiClient
import "../../styles/AI.css";

const TrendDetection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [timeframe, setTimeframe] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState([]);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError("");
    setTrends([]);
    setInsights([]);
    
    try {
      const response = await aiService.trendDetection({ // Fixed: Use aiService instead of apiClient
        timeframe,
        userId: user?.id
      });
      
      setTrends(response.trends || []);
      setInsights(response.insights || []);
    } catch (err) {
      console.error("Trend detection error:", err);
      setError("Failed to detect trends. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [timeframe, user]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const getTrendIcon = (change) => {
    if (change > 0) return "📈";
    if (change < 0) return "📉";
    return "➡️";
  };

  const getTrendClass = (change) => {
    if (change > 0) return "positive";
    if (change < 0) return "negative";
    return "neutral";
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>📈 Trend Detection</h1>
        <p>Discover emerging topics and popular resources in your field</p>
      </div>

      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        <button 
          className={`timeframe-btn ${timeframe === "week" ? "active" : ""}`}
          onClick={() => handleTimeframeChange("week")}
        >
          Week
        </button>
        <button 
          className={`timeframe-btn ${timeframe === "month" ? "active" : ""}`}
          onClick={() => handleTimeframeChange("month")}
        >
          Month
        </button>
        <button 
          className={`timeframe-btn ${timeframe === "quarter" ? "active" : ""}`}
          onClick={() => handleTimeframeChange("quarter")}
        >
          Quarter
        </button>
        <button 
          className={`timeframe-btn ${timeframe === "year" ? "active" : ""}`}
          onClick={() => handleTimeframeChange("year")}
        >
          Year
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing trends and patterns...</p>
        </div>
      ) : (
        <div className="trends-content">
          {/* Insights Section */}
          {insights.length > 0 && (
            <div className="insights-section card">
              <h2>💡 Key Insights</h2>
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-icon">✨</div>
                    <div className="insight-content">
                      <h3>{insight.title}</h3>
                      <p>{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends Section */}
          <div className="trends-section">
            <h2>📊 Top Trends</h2>
            {trends.length > 0 ? (
              <div className="trends-list">
                {trends.map((trend, index) => (
                  <div key={index} className="trend-item card">
                    <div className="trend-rank">#{index + 1}</div>
                    <div className="trend-main">
                      <h3>{trend.term}</h3>
                      <div className="trend-stats">
                        <span className="trend-volume">Volume: {trend.volume}</span>
                        <span className={`trend-change ${getTrendClass(trend.change)}`}>
                          {getTrendIcon(trend.change)} {Math.abs(trend.change)}%
                        </span>
                      </div>
                    </div>
                    <div className="trend-category">
                      <span className="badge">{trend.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-trends">
                <div className="empty-icon">📊</div>
                <h3>No Trends Detected</h3>
                <p>We couldn't detect any significant trends for the selected timeframe.</p>
                <button 
                  className="btn btn-primary"
                  onClick={fetchTrends}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendDetection;