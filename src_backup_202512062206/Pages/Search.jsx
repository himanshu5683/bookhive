import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import apiClient from '../services/api';
import ResourceCard from './common/ResourceCard';
import '../styles/Search.css';

const Search = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ resources: [], users: [] });
  const [aiSearchParams, setAiSearchParams] = useState(null);
  const [activeTab, setActiveTab] = useState('resources');
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults({ resources: [], users: [] });
      setAiSearchParams(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, try AI-powered search parameter extraction
      setAiProcessing(true);
      try {
        const aiResponse = await apiClient.aiAPI.search({
          query: searchTerm,
          userId: user ? user.id : undefined
        });
        
        setAiSearchParams(aiResponse.searchParams);
        
        // Use AI-extracted parameters for more precise search
        const { keywords, genres, authors, title } = aiResponse.searchParams;
        
        // Build search query
        let searchQuery = searchTerm;
        if (keywords && keywords.length > 0) {
          searchQuery = keywords.join(' ');
        }
        
        // Search resources with AI-enhanced parameters
        const resourceFilters = { 
          search: searchQuery,
          limit: 20 
        };
        
        if (genres && genres.length > 0) {
          resourceFilters.category = genres[0]; // Use first genre as category filter
        }
        
        const resourceResponse = await apiClient.resourcesAPI.getAll(resourceFilters);
        
        // Search users
        const userResponse = await apiClient.usersAPI.getAll({ 
          search: searchQuery,
          limit: 20 
        });

        setSearchResults({
          resources: resourceResponse.resources || [],
          users: userResponse.users || []
        });
      } catch (aiError) {
        console.log('AI search failed, falling back to standard search');
        // Fallback to standard search
        const resourceResponse = await apiClient.resourcesAPI.getAll({ 
          search: searchTerm,
          limit: 20 
        });
        
        const userResponse = await apiClient.usersAPI.getAll({ 
          search: searchTerm,
          limit: 20 
        });

        setSearchResults({
          resources: resourceResponse.resources || [],
          users: userResponse.users || []
        });
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to perform search. Please try again.');
      setSearchResults({ resources: [], users: [] });
    } finally {
      setLoading(false);
      setAiProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="search-page">
      {/* Hero */}
      <div className="search-hero">
        <h1>🔍 Search BookHive</h1>
        <p>Find resources, users, and content across the platform</p>
      </div>

      {/* Search Form */}
      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for resources, users, tags..."
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading || aiProcessing}>
              {aiProcessing ? 'Analyzing...' : loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {aiProcessing && (
          <div className="ai-processing">
            <div className="processing-spinner"></div>
            <p>AI is analyzing your query for better results...</p>
          </div>
        )}
        
        {aiSearchParams && (
          <div className="ai-search-params">
            <h4>AI Analysis:</h4>
            <div className="params-grid">
              {aiSearchParams.keywords && aiSearchParams.keywords.length > 0 && (
                <div className="param-item">
                  <strong>Keywords:</strong> {aiSearchParams.keywords.join(", ")}
                </div>
              )}
              {aiSearchParams.genres && aiSearchParams.genres.length > 0 && (
                <div className="param-item">
                  <strong>Genres:</strong> {aiSearchParams.genres.join(", ")}
                </div>
              )}
              {aiSearchParams.authors && aiSearchParams.authors.length > 0 && (
                <div className="param-item">
                  <strong>Authors:</strong> {aiSearchParams.authors.join(", ")}
                </div>
              )}
              {aiSearchParams.title && (
                <div className="param-item">
                  <strong>Title:</strong> {aiSearchParams.title}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      {searchTerm.trim() && (
        <div className="search-tabs">
          <button 
            className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources ({searchResults.resources.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({searchResults.users.length})
          </button>
        </div>
      )}

      {/* Results */}
      {searchTerm.trim() && (
        <div className="search-results">
          {activeTab === 'resources' ? (
            <div className="results-section">
              <h2>📚 Resources</h2>
              {loading ? (
                <div className="loading-state">
                  <p>Searching resources...</p>
                </div>
              ) : searchResults.resources.length > 0 ? (
                <div className="resources-grid">
                  {searchResults.resources.map(resource => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No resources found for "{searchTerm}"</p>
                  <button 
                    className="smart-search-btn"
                    onClick={handleSearch}
                  >
                    Try AI-Powered Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="results-section">
              <h2>👥 Users</h2>
              {loading ? (
                <div className="loading-state">
                  <p>Searching users...</p>
                </div>
              ) : searchResults.users.length > 0 ? (
                <div className="users-grid">
                  {searchResults.users.map(user => (
                    <div key={user._id} className="user-card">
                      <div className="user-avatar">{user.avatar || '👤'}</div>
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <p className="user-email">{user.email}</p>
                        <div className="user-stats">
                          <span>💰 {user.credits || 0} credits</span>
                          <span>📤 {user.contributions || 0} contributions</span>
                        </div>
                        {user.tags && user.tags.length > 0 && (
                          <div className="user-tags">
                            {user.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No users found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchTerm.trim() && (
        <div className="search-empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Search BookHive</h3>
          <p>Enter a term above to search for resources and users</p>
          <div className="search-tips">
            <h4>Search Tips:</h4>
            <ul>
              <li>Use natural language: "best programming books for beginners"</li>
              <li>Search by tags: "mathematics, calculus, textbook"</li>
              <li>Find users by interests: "machine learning enthusiast"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;