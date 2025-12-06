import React, { useState } from "react";
import apiClient from "../../services/api";
import "../../styles/AI.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setLoading(true);
    setError("");
    setResults([]);
    setSearchParams(null);
    
    try {
      // First, use AI to extract search parameters
      const aiResponse = await apiClient.aiAPI.search({
        query: query
      });
      
      setSearchParams(aiResponse.searchParams);
      
      // In a real implementation, you would use these parameters to filter actual resources
      // For now, we'll simulate results
      const mockResults = [
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          description: "A classic American novel set in the Jazz Age",
          genre: "Classic Literature"
        },
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          description: "A gripping tale of racial injustice and childhood innocence",
          genre: "Classic Literature"
        },
        {
          id: 3,
          title: "1984",
          author: "George Orwell",
          description: "A dystopian social science fiction novel",
          genre: "Science Fiction"
        }
      ];
      
      setResults(mockResults);
    } catch (err) {
      console.error("Error performing search:", err);
      setError("Failed to perform search. Please try again.");
      
      // Fallback to basic search
      const mockResults = [
        {
          id: 1,
          title: "Sample Book Result",
          author: "Sample Author",
          description: "This is a sample search result.",
          genre: "General"
        }
      ];
      
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
    setSearchParams(null);
  };

  return (
    <div className="resources-container">
      <div className="resources-header">
        <h1>🔍 AI-Powered Search</h1>
        <p>Smart search with natural language processing</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for books, authors, genres... (e.g., 'science fiction books about space exploration')"
            />
            <button 
              type="submit" 
              className="search-button" 
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          
          <button 
            type="button" 
            className="clear-button" 
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {searchParams && (
          <div className="search-params">
            <h3>AI Extracted Search Parameters</h3>
            <div className="params-grid">
              <div className="param-item">
                <strong>Keywords:</strong> {searchParams.keywords?.join(", ") || "None"}
              </div>
              <div className="param-item">
                <strong>Genres:</strong> {searchParams.genres?.join(", ") || "None"}
              </div>
              <div className="param-item">
                <strong>Authors:</strong> {searchParams.authors?.join(", ") || "None"}
              </div>
              <div className="param-item">
                <strong>Title:</strong> {searchParams.title || "None"}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Analyzing your query with AI...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="resources-grid">
            <h3>Search Results</h3>
            {results.map((book) => (
              <div key={book.id} className="resource-card">
                <div className="card-content">
                  <h3 className="resource-title">{book.title}</h3>
                  <p className="resource-author">by {book.author}</p>
                  <p className="resource-description">{book.description}</p>
                  <div className="resource-meta">
                    <span className="resource-genre">{book.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading && (
          <div className="no-results">
            <p>No results found for "{query}". Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;