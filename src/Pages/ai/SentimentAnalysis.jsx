import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { aiService } from "../../services/api"; // Fixed: Import aiService instead of apiClient
import "../../styles/AI.css";

const SentimentAnalysis = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [sentimentResult, setSentimentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      setError("Please enter text to analyze");
      return;
    }
    
    setLoading(true);
    setError("");
    setSentimentResult(null);
    
    try {
      const response = await aiService.sentimentAnalysis({ // Fixed: Use aiService instead of apiClient
        text: textInput,
        userId: user?.id
      });
      
      const result = {
        ...response,
        text: textInput.substring(0, 100) + (textInput.length > 100 ? "..." : ""),
        timestamp: new Date()
      };
      
      setSentimentResult(result);
      
      // Add to history
      setHistory(prev => [result, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error("Sentiment analysis error:", err);
      setError("Failed to analyze sentiment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.5) return "positive";
    if (score < 0.5) return "negative";
    return "neutral";
  };

  const getSentimentLabel = (score) => {
    if (score > 0.7) return "Very Positive";
    if (score > 0.5) return "Positive";
    if (score === 0.5) return "Neutral";
    if (score > 0.3) return "Negative";
    return "Very Negative";
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🧠 Sentiment Analysis</h1>
        <p>Analyze the emotional tone of text content</p>
      </div>

      <div className="sentiment-content">
        <div className="sentiment-input-section card">
          <h2>Analyze Text</h2>
          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label>Text to Analyze</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to analyze for sentiment (reviews, comments, feedback, etc.)"
                rows={6}
                disabled={loading}
              />
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !textInput.trim()}
            >
              {loading ? "Analyzing..." : "Analyze Sentiment"}
            </button>
          </form>
        </div>

        {sentimentResult && (
          <div className="sentiment-result-section card">
            <h2>Analysis Results</h2>
            <div className="sentiment-overview">
              <div className="sentiment-score">
                <div className="score-value">{(sentimentResult.score * 100).toFixed(1)}%</div>
                <div className="score-label">Sentiment Score</div>
              </div>
              <div className="sentiment-details">
                <div className={`sentiment-label ${getSentimentColor(sentimentResult.score)}`}>
                  {getSentimentLabel(sentimentResult.score)}
                </div>
                <div className="confidence">
                  Confidence: {(sentimentResult.confidence * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            {sentimentResult.keywords && (
              <div className="sentiment-keywords">
                <h3>Key Emotional Terms</h3>
                <div className="keywords-list">
                  {sentimentResult.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-badge">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="sentiment-text-preview">
              <h3>Analyzed Text</h3>
              <p>"{sentimentResult.text}"</p>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="sentiment-history-section card">
            <h2>Recent Analyses</h2>
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-text">"{item.text}"</div>
                  <div className={`history-sentiment ${getSentimentColor(item.score)}`}>
                    {getSentimentLabel(item.score)} ({(item.score * 100).toFixed(1)}%)
                  </div>
                  <div className="history-time">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;