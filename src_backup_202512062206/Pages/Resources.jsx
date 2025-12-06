import React, { useState, useMemo } from 'react';
import ResourceCard from './common/ResourceCard';
import '../styles/Resources.css';
import useResources from '../hooks/useResources';

// Categories for filtering
const categories = [
  { name: 'Programming', emoji: '💻' },
  { name: 'Science', emoji: '🔬' },
  { name: 'Mathematics', emoji: '📐' },
  { name: 'Technology', emoji: '🤖' },
  { name: 'Business', emoji: '📊' },
  { name: 'Arts', emoji: '🎨' },
  { name: 'Languages', emoji: '🌍' },
  { name: 'Other', emoji: '📚' }
];

const Resources = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const { resources: allResources, loading, error, fetchResources } = useResources();

  // Fetch resources when sort order changes
  React.useEffect(() => {
    fetchResources(sortBy);
  }, [sortBy, fetchResources]);

  // Filter and search resources
  const filteredResources = useMemo(() => {
    return allResources.filter(resource => {
      // Type filter
      if (filterType !== 'all' && resource.type !== filterType) {
        return false;
      }
      
      // Category filter
      if (filterCategory !== 'all' && resource.category !== filterCategory) {
        return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.author.toLowerCase().includes(query) ||
          (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      return true;
    });
  }, [allResources, filterType, filterCategory, searchQuery]);

  // Get top rated resources
  const topRatedResources = useMemo(() => {
    return [...allResources]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [allResources]);

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>📚 Resource Library</h1>
        <p>Browse and download educational resources shared by our community</p>
      </div>

      {/* Search and Filters */}
      <div className="resources-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filters">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="note">📝 Notes</option>
            <option value="pdf">📄 PDFs</option>
            <option value="document">📄 Documents</option>
            <option value="video">🎬 Videos</option>
            <option value="audio">🎵 Audio</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">📅 Newest First</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="downloads">⬇️ Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Top Rated Section */}
      {topRatedResources.length > 0 && (
        <div className="top-rated-section">
          <h2>⭐ Top Rated Resources</h2>
          <div className="resources-grid">
            {topRatedResources.map(resource => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div className="all-resources-section">
        <div className="section-header">
          <h2>📖 All Resources</h2>
          <p>{filteredResources.length} resources found</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading resources...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="resources-grid">
            {filteredResources.map(resource => (
              <ResourceCard key={resource._id} resource={resource} showRating={true} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No resources found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;