import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";
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
      const response = await apiClient.aiAPI.sentimentAnalysis({
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

  const handleClear = () => {
    setTextInput("");
    setSentimentResult(null);
    setError("");
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case "positive": return "sentiment-positive";
      case "negative": return "sentiment-negative";
      case "neutral": return "sentiment-neutral";
      default: return "";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive": return "😊";
      case "negative": return "😞";
      case "neutral": return "😐";
      default: return "🤔";
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  // Sample texts for quick testing
  const sampleTexts = [
    "I absolutely love this book! The characters are well-developed and the plot keeps you engaged from start to finish.",
    "This book was disappointing. The story felt rushed and the ending was unsatisfying.",
    "The book provides a comprehensive overview of the subject matter. It's informative but not particularly engaging.",
    "Could you recommend some similar books to this one? I'm looking for something with a strong female protagonist."
  ];

  const loadSampleText = (text) => {
    setTextInput(text);
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🧠 AI Sentiment Analysis</h1>
        <p>Analyze the sentiment of reviews, comments, and discussions</p>
      </div>

      <div className="sentiment-container">
        <div className="sentiment-analysis-section card">
          <form onSubmit={handleAnalyze} className="ai-form">
            <div className="form-group">
              <label htmlFor="textInput">Text to Analyze</label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to analyze for sentiment (reviews, comments, discussions, etc.)..."
                disabled={loading}
                rows={6}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Sentiment"}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Analyzing sentiment with AI...</p>
            </div>
          )}

          {sentimentResult && (
            <div className="sentiment-result card">
              <h3>Analysis Result</h3>
              <div className={`sentiment-display ${getSentimentClass(sentimentResult.sentiment)}`}>
                <div className="sentiment-icon">{getSentimentIcon(sentimentResult.sentiment)}</div>
                <div className="sentiment-info">
                  <h4 className="sentiment-title">{sentimentResult.sentiment.charAt(0).toUpperCase() + sentimentResult.sentiment.slice(1)}</h4>
                  <p className="sentiment-confidence">
                    Confidence: {getConfidenceLevel(sentimentResult.confidence)} ({(sentimentResult.confidence * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
              
              {sentimentResult.emotions && (
                <div className="emotions-section">
                  <h4>Detected Emotions</h4>
                  <div className="emotions-grid">
                    {Object.entries(sentimentResult.emotions).map(([emotion, score]) => (
                      <div key={emotion} className="emotion-item">
                        <span className="emotion-name">{emotion}</span>
                        <div className="emotion-bar">
                          <div 
                            className="emotion-fill" 
                            style={{width: `${score * 100}%`}}
                          ></div>
                        </div>
                        <span className="emotion-score">{(score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sentimentResult.keyPhrases && sentimentResult.keyPhrases.length > 0 && (
                <div className="key-phrases-section">
                  <h4>Key Phrases</h4>
                  <div className="phrases-container">
                    {sentimentResult.keyPhrases.map((phrase, index) => (
                      <span key={index} className="key-phrase badge badge-secondary">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Texts */}
        <div className="sample-texts-section card">
          <h3>Quick Samples</h3>
          <div className="samples-grid">
            {sampleTexts.map((text, index) => (
              <div key={index} className="sample-item">
                <p>"{text}"</p>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => loadSampleText(text)}
                  disabled={loading}
                >
                  Load Sample
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis History */}
        {history.length > 0 && (
          <div className="history-section card">
            <h3>Recent Analyses</h3>
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-text">"{item.text}"</div>
                  <div className={`history-sentiment ${getSentimentClass(item.sentiment)}`}>
                    {getSentimentIcon(item.sentiment)} {item.sentiment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section card">
        <h3>💡 Tips for Sentiment Analysis</h3>
        <ul className="tips-list">
          <li>Provide context-rich text for more accurate sentiment detection</li>
          <li>Longer texts generally produce more reliable results</li>
          <li>The AI detects emotions like joy, anger, fear, sadness, and surprise</li>
          <li>Use this tool to understand community feedback on books and resources</li>
        </ul>
      </div>

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

export default SentimentAnalysis;