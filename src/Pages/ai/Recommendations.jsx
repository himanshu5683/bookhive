import React, { useState, useEffect, useCallback, useContext } from "react";
import AuthContext from "../../auth/AuthContext";
import apiClient, { aiAPI } from "../../services/api";
import "../../styles/AI.css";

const Recommendations = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genre, setGenre] = useState("");
  const [interests, setInterests] = useState("");
  const [history, setHistory] = useState("");

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const requestData = {
        genre: genre || undefined,
        interests: interests || undefined,
        history: history || undefined,
        userId: user ? user.id : undefined
      };
      
      const response = await aiAPI.getRecommendations(requestData);
      
      setRecommendations(response.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [genre, interests, history, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  // Load initial recommendations
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>📚 AI Book Recommendations</h1>
        <p>Discover your next favorite book with personalized recommendations</p>
      </div>

      <div className="recommendations-filter">
        <form onSubmit={handleSubmit} className="filter-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Preferred Genre</label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g., Science Fiction, Mystery, Romance"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="interests">Your Interests</label>
              <input
                id="interests"
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Space, History, Technology"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="history">Recent Reads (comma separated)</label>
            <input
              id="history"
              type="text"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder="e.g., Dune, The Hobbit, 1984"
            />
          </div>
          
          <button type="submit" className="filter-button" disabled={loading}>
            {loading ? "Finding Recommendations..." : "Get Recommendations"}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="resources-grid">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Finding the perfect books for you...</p>
          </div>
        ) : recommendations.length > 0 ? (
          recommendations.map((book, index) => (
            <div key={index} className="resource-card">
              <div className="card-content">
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
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No recommendations found. Try adjusting your preferences.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;