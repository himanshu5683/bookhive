import React, { useState, useContext, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import apiClient from "../services/api";
import "../styles/AI.css";

const SmartSearchBar = ({ placeholder = "Search books, authors, topics...", className = "" }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Navigate to search results
    if (suggestion.startsWith("Search for")) {
      const searchTerm = suggestion.match(/"([^"]+)"/)?.[1] || suggestion;
      navigate(`/resources?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate("/resources");
    }
  }, [navigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use AI to extract search parameters and get suggestions
      const response = await apiClient.aiAPI.search({
        query: searchQuery,
        userId: user?.id
      });

      // Mock suggestions based on AI response
      const mockSuggestions = [
        `Search for "${searchQuery}"`,
        `Find books about ${response.searchParams?.genres?.[0] || 'similar topics'}`,
        `Look for authors like ${response.searchParams?.authors?.[0] || 'popular writers'}`,
        `Explore ${response.searchParams?.keywords?.[0] || 'related'} topics`
      ];

      setSuggestions(mockSuggestions);
    } catch (err) {
      console.error("Search suggestions error:", err);
      setSuggestions([
        `Search for "${searchQuery}"`,
        "Browse all resources",
        "Find popular books",
        "Search by genre"
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const debouncedFetchSuggestions = useCallback((query) => {
    clearTimeout(searchRef.current?.timeoutId);
    searchRef.current.timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  }, [fetchSuggestions]);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      debouncedFetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/resources?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`smart-search-container ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="smart-search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            placeholder={placeholder}
            className="smart-search-input"
            autoComplete="off"
          />
          <button type="submit" className="search-submit-btn btn btn-icon btn-ghost">
            <span className="search-icon">🔍</span>
          </button>
        </div>
        
        {showSuggestions && (
          <div className="search-suggestions-dropdown" ref={suggestionsRef}>
            {isLoading ? (
              <div className="suggestion-item loading">
                <div className="spinner-small"></div>
                <span>Getting smart suggestions...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  type="button"
                >
                  <span className="suggestion-icon">✨</span>
                  <span className="suggestion-text">{suggestion}</span>
                </button>
              ))
            ) : (
              <div className="suggestion-item no-results">
                <span>No suggestions found</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SmartSearchBar;