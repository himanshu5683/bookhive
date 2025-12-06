import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const AutoTag = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerateTags = async (e) => {
    e.preventDefault();
    
    if (!resourceTitle.trim() && !resourceDescription.trim()) {
      setError("Please enter either a title or description");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    setTags([]);
    setSuggestedTags([]);
    
    try {
      const response = await apiClient.aiAPI.autoTag({
        title: resourceTitle,
        description: resourceDescription,
        userId: user?.id
      });
      
      setSuggestedTags(response.tags || []);
    } catch (err) {
      console.error("Auto-tagging error:", err);
      setError("Failed to generate tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCustomTagAdd = (e) => {
    e.preventDefault();
    const customTagInput = e.target.customTag.value.trim();
    if (customTagInput && !tags.includes(customTagInput)) {
      setTags([...tags, customTagInput]);
      e.target.customTag.value = "";
    }
  };

  const handleSaveTags = async () => {
    if (tags.length === 0) {
      setError("Please add at least one tag");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Simulate saving tags to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(`Successfully saved ${tags.length} tags!`);
      setSuggestedTags([]);
      setResourceTitle("");
      setResourceDescription("");
    } catch (err) {
      console.error("Save tags error:", err);
      setError("Failed to save tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResourceTitle("");
    setResourceDescription("");
    setTags([]);
    setSuggestedTags([]);
    setError("");
    setSuccess("");
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🏷️ AI Auto-Tagging</h1>
        <p>Automatically generate relevant tags for your resources</p>
      </div>

      <div className="auto-tag-container card">
        <form onSubmit={handleGenerateTags} className="ai-form">
          <div className="form-group">
            <label htmlFor="resourceTitle">Resource Title</label>
            <input
              id="resourceTitle"
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              placeholder="Enter the title of your resource..."
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="resourceDescription">Resource Description</label>
            <textarea
              id="resourceDescription"
              value={resourceDescription}
              onChange={(e) => setResourceDescription(e.target.value)}
              placeholder="Enter a description of your resource..."
              disabled={loading}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Generating Tags..." : "Generate AI Tags"}
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
        {success && <div className="alert alert-success">{success}</div>}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generating tags with AI...</p>
          </div>
        )}

        {suggestedTags.length > 0 && (
          <div className="suggested-tags-section">
            <h3>Suggested Tags</h3>
            <div className="tags-container">
              {suggestedTags.map((tag, index) => (
                <button
                  key={index}
                  className={`tag-suggestion ${tags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => handleAddTag(tag)}
                  disabled={tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="selected-tags-section">
            <h3>Selected Tags</h3>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div key={index} className="selected-tag">
                  <span className="tag-text">{tag}</span>
                  <button 
                    className="tag-remove btn btn-icon btn-ghost"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleCustomTagAdd} className="custom-tag-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customTag">Add Custom Tag</label>
                  <input
                    id="customTag"
                    type="text"
                    placeholder="Enter a custom tag..."
                    disabled={loading}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </form>
            
            <div className="form-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSaveTags}
                disabled={loading}
              >
                Save Tags
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section card">
        <h3>💡 Tips for Better Tagging</h3>
        <ul className="tips-list">
          <li>Provide detailed titles and descriptions for more accurate tagging</li>
          <li>Review and customize suggested tags to match your specific needs</li>
          <li>Use a mix of general and specific tags for better organization</li>
          <li>Consistent tagging improves searchability across your resources</li>
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

export default AutoTag;