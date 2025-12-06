import React from "react";
import "../styles/AI.css";

const AIInsightsCard = ({ 
  title, 
  insights = [], 
  isLoading = false, 
  error = null,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`ai-insights-card card ${className}`}>
        <div className="insights-header">
          <h3>{title || "AI Insights"}</h3>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analyzing with AI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ai-insights-card card ${className}`}>
        <div className="insights-header">
          <h3>{title || "AI Insights"}</h3>
        </div>
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-insights-card card ${className}`}>
      <div className="insights-header">
        <h3>{title || "AI Insights"}</h3>
      </div>
      
      {insights.length > 0 ? (
        <div className="insights-content">
          <ul className="insights-list">
            {insights.map((insight, index) => (
              <li key={index} className="insight-item">
                <div className="insight-icon">✨</div>
                <div className="insight-text">
                  {typeof insight === 'string' ? insight : insight.text}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="no-insights">
          <p>No insights available at this time.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;