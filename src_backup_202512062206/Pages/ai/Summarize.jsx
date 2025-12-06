import React, { useState } from "react";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const Summarize = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maxLength, setMaxLength] = useState(100);

  const handleSummarize = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError("Please enter some text to summarize");
      return;
    }
    
    setLoading(true);
    setError("");
    setSummary("");
    
    try {
      const response = await apiClient.aiAPI.summarize({
        text: inputText,
        maxLength: maxLength
      });
      
      setSummary(response.summary);
    } catch (err) {
      console.error("Error summarizing text:", err);
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

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>📝 AI Content Summarizer</h1>
        <p>Summarize book descriptions and other content with AI</p>
      </div>

      <div className="summarize-container">
        <form onSubmit={handleSummarize} className="summarize-form">
          <div className="form-group">
            <label htmlFor="maxLength">Summary Length (words)</label>
            <input
              id="maxLength"
              type="number"
              min="20"
              max="500"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value) || 100)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="inputText">Text to Summarize</label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a book description or any text you'd like summarized..."
              rows={8}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading || !inputText.trim()}
            >
              {loading ? "Summarizing..." : "Summarize"}
            </button>
            <button 
              type="button" 
              className="secondary-button" 
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {summary && (
          <div className="summary-result">
            <h3>Summary</h3>
            <div className="summary-content">
              <p>{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarize;