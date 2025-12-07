import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const Summarize = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [maxLength, setMaxLength] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError("Please enter text to summarize");
      return;
    }
    
    if (inputText.split(' ').length < 20) {
      setError("Please enter at least 20 words for summarization");
      return;
    }
    
    setLoading(true);
    setError("");
    setSummary("");
    
    try {
      const response = await apiClient.aiAPI.summarize({
        text: inputText,
        maxLength
      });
      
      setSummary(response.summary);
    } catch (err) {
      console.error("Summarization error:", err);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setSummary("");
    setError("");
  };

  // Sample text for demonstration
  const sampleText = `Artificial Intelligence (AI) is transforming the way we live, work, and interact with technology. From virtual assistants like Siri and Alexa to recommendation systems on Netflix and Amazon, AI has become an integral part of our daily lives. In the healthcare industry, AI is being used to diagnose diseases, develop new drugs, and personalize treatment plans. Financial institutions leverage AI for fraud detection, algorithmic trading, and customer service automation. The automotive industry is investing heavily in AI for autonomous vehicles, which promise to revolutionize transportation. Despite its benefits, AI also raises ethical concerns about job displacement, privacy, and decision-making transparency. As AI continues to evolve, it is crucial to develop responsible AI practices that prioritize human welfare and societal good.`;

  const loadSampleText = () => {
    setInputText(sampleText);
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>📝 AI Content Summarizer</h1>
        <p>Generate concise summaries of books, articles, and other content</p>
      </div>

      <div className="summarize-container">
        <form onSubmit={handleSummarize} className="summarize-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxLength">Maximum Summary Length (words)</label>
              <input
                id="maxLength"
                type="number"
                min="20"
                max="500"
                value={maxLength}
                onChange={(e) => setMaxLength(parseInt(e.target.value) || 100)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="inputText">Content to Summarize</label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text you want to summarize here..."
              disabled={loading}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Summarizing..." : "Generate Summary"}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={loadSampleText}
              disabled={loading}
            >
              Load Sample Text
            </button>
          </div>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generating summary with AI...</p>
          </div>
        )}

        {summary && (
          <div className="summary-result">
            <h3>AI-Generated Summary</h3>
            <div className="summary-content">
              <p>{summary}</p>
            </div>
            <div className="summary-meta">
              <span className="word-count">
                Summary: {summary.split(' ').filter(word => word.length > 0).length} words
              </span>
              <span className="original-count">
                Original: {inputText.split(' ').filter(word => word.length > 0).length} words
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section card">
        <h3>💡 Tips for Better Summaries</h3>
        <ul className="tips-list">
          <li>Provide clear and well-structured content for best results</li>
          <li>Longer texts generally produce more accurate summaries</li>
          <li>Adjust the word limit based on your needs</li>
          <li>AI works best with factual content rather than creative writing</li>
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

export default Summarize;