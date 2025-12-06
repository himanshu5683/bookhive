import React, { useState, useEffect } from "react";
import "../styles/AI.css";

const SmartFilters = ({ 
  filters = {}, 
  onFilterChange = () => {}, 
  onReset = () => {},
  className = ""
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // AI-powered smart filter suggestions
  const smartFilterSuggestions = [
    { name: "Popular this week", filters: { sortBy: "popularity", timeRange: "week" } },
    { name: "Highly rated", filters: { sortBy: "rating", minRating: 4 } },
    { name: "New releases", filters: { sortBy: "date", order: "desc" } },
    { name: "Free resources", filters: { isFree: true } }
  ];

  const handleApplySuggestion = (suggestion) => {
    const newFilters = { ...localFilters, ...suggestion.filters };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={`smart-filters ${className}`}>
      {/* Smart Filter Suggestions */}
      <div className="filter-suggestions">
        <h4>Smart Filters</h4>
        <div className="suggestions-grid">
          {smartFilterSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-chip btn btn-outline btn-sm"
              onClick={() => handleApplySuggestion(suggestion)}
            >
              {suggestion.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Filter Controls */}
      <div className="filter-controls">
        <button 
          className="expand-toggle btn btn-ghost"
          onClick={toggleExpand}
        >
          {isExpanded ? "▲ Hide Filters" : "▼ Show Filters"}
        </button>

        {isExpanded && (
          <div className="filter-options animate-fadeIn">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="sortBy">Sort By</label>
                <select
                  id="sortBy"
                  value={localFilters.sortBy || ""}
                  onChange={(e) => handleChange("sortBy", e.target.value)}
                  className="form-select"
                >
                  <option value="">Default</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="date">Date Added</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="order">Order</label>
                <select
                  id="order"
                  value={localFilters.order || ""}
                  onChange={(e) => handleChange("order", e.target.value)}
                  className="form-select"
                >
                  <option value="">Default</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={localFilters.category || ""}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="science">Science</option>
                  <option value="technology">Technology</option>
                  <option value="history">History</option>
                  <option value="biography">Biography</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="minRating">Min Rating</label>
                <select
                  id="minRating"
                  value={localFilters.minRating || ""}
                  onChange={(e) => handleChange("minRating", e.target.value)}
                  className="form-select"
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.isFree || false}
                    onChange={(e) => handleChange("isFree", e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Free Resources Only
                </label>
              </div>

              <div className="filter-group checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={localFilters.hasAudio || false}
                    onChange={(e) => handleChange("hasAudio", e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Has Audio Version
                </label>
              </div>
            </div>

            <div className="filter-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFilters;