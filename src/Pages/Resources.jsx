import React, { useState, useMemo, useEffect } from 'react';
import ResourceCard from './common/ResourceCard';
import '../styles/Resources.css';
import apiClient from '../services/api';

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
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.resourcesAPI.getAll({ sort: sortBy });
        setAllResources(response.resources || []);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again.');
        setAllResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [sortBy]);

  const filtered = useMemo(() => {
    let result = [...allResources];
    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterCategory !== 'all') result = result.filter(r => r.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.author || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'downloads') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sortBy === 'recent') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [filterType, filterCategory, searchQuery, sortBy, allResources]);

  return (
    <div className="resources-page">
      <div className="resources-hero">
        <h1>📚 Resource Library</h1>
        <p>Discover notes, PDFs, and learning materials shared by the community</p>
      </div>

      <div className="resources-controls">
        <input
          type="text"
          placeholder="🔍 Search resources..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <div className="filters-row">
          <div className="filter-group">
            <label>Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} disabled={loading}>
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="pdf">PDFs</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} disabled={loading}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={loading}>
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading resources...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="resources-info">
            <p>{filtered.length} resources found</p>
          </div>

          <div className="resources-grid">
            {filtered.map(resource => (
              <ResourceCard key={resource._id || resource.id} resource={resource} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="no-results">
              <p>😢 No resources match your search. Try adjusting your filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Resources;
