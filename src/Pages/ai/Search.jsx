import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const Search = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchParams, setSearchParams] = useState({
    keywords: [],
    genres: [],
    authors: [],
    title: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showParams, setShowParams] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setLoading(true);
    setError("");
    setSearchResults([]);
    
    try {
      // First, use AI to extract search parameters
      const aiResponse = await apiClient.aiAPI.search({
        query,
        userId: user?.id
      });
      
      setSearchParams(aiResponse.searchParams);
      setShowParams(true);
      
      // Then, simulate searching with these parameters
      // In a real app, you would call your actual search API here
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            title: "JavaScript: The Definitive Guide",
            author: "David Flanagan",
            description: "A comprehensive guide to JavaScript programming",
            genre: "Programming",
            rating: 4.8
          },
          {
            id: 2,
            title: "Clean Code",
            author: "Robert Martin",
            description: "A handbook of agile software craftsmanship",
            genre: "Software Engineering",
            rating: 4.7
          },
          {
            id: 3,
            title: "You Don't Know JS",
            author: "Kyle Simpson",
            description: "Deep dive into JavaScript mechanics",
            genre: "Programming",
            rating: 4.6
          }
        ];
        
        setSearchResults(mockResults);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to perform search. Please try again.");
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
    setSearchParams({
      keywords: [],
      genres: [],
      authors: [],
      title: ""
    });
    setShowParams(false);
    setError("");
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🔍 AI-Powered Search</h1>
        <p>Find books and resources with intelligent natural language search</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for books, authors, genres, or topics..."
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-button btn btn-primary"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button 
              type="button" 
              className="clear-button btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {showParams && (
          <div className="search-params">
            <h3>AI Extracted Search Parameters</h3>
            <div className="params-grid">
              {searchParams.keywords.length > 0 && (
                <div className="param-item">
                  <strong>Keywords:</strong> {searchParams.keywords.join(", ")}
                </div>
              )}
              {searchParams.genres.length > 0 && (
                <div className="param-item">
                  <strong>Genres:</strong> {searchParams.genres.join(", ")}
                </div>
              )}
              {searchParams.authors.length > 0 && (
                <div className="param-item">
                  <strong>Authors:</strong> {searchParams.authors.join(", ")}
                </div>
              )}
              {searchParams.title && (
                <div className="param-item">
                  <strong>Title:</strong> {searchParams.title}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Analyzing your query with AI...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results ({searchResults.length})</h3>
            <div className="results-grid">
              {searchResults.map((result) => (
                <div key={result.id} className="result-card card">
                  <h4 className="result-title">{result.title}</h4>
                  <p className="result-author">by {result.author}</p>
                  <p className="result-description">{result.description}</p>
                  <div className="result-meta">
                    <span className="result-genre badge badge-secondary">
                      {result.genre}
                    </span>
                    <span className="result-rating">
                      ⭐ {result.rating}
                    </span>
                  </div>
                  <div className="result-actions">
                    <button className="btn btn-primary btn-sm">
                      View Details
                    </button>
                    <button className="btn btn-secondary btn-sm">
                      Add to Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !loading && query && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or browse our recommendations</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/ai/recommendations")}
            >
              Get AI Recommendations
            </button>
          </div>
        )}
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

export default Search;