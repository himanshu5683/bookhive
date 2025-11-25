import React, { useState, useMemo, useEffect } from 'react';
import { sampleNotes, samplePDFs, categories } from '../data/sampleData';
import ResourceCard from '../components/ResourceCard';
import '../styles/Resources.css';

const Resources = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [allResources, setAllResources] = useState([]);

  // Fetch resources from API or use sample data
  useEffect(() => {
    const fetchResources = async () => {
      try {
        // TODO: Uncomment when backend is ready
        // const data = await resourcesAPI.getAll({ sortBy });
        // setAllResources(data.resources);
        
        // For now, use sample data
        const resources = [
          ...sampleNotes.map(n => ({ ...n, type: 'note' })),
          ...samplePDFs.map(p => ({ ...p, type: 'pdf' })),
        ];
        setAllResources(resources);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        // Fallback to sample data
        const resources = [
          ...sampleNotes.map(n => ({ ...n, type: 'note' })),
          ...samplePDFs.map(p => ({ ...p, type: 'pdf' })),
        ];
        setAllResources(resources);
      }
    };

    fetchResources();
  }, []);

  // Filter resources
  const filtered = useMemo(() => {
    let result = allResources;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(r => r.category === filterCategory);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.timestamp - a.timestamp);
    }

    return result;
  }, [filterType, filterCategory, searchQuery, sortBy, allResources]);

  return (
    <div className="resources-page">
      {/* Hero Section */}
      <div className="resources-hero">
        <h1>📚 Resource Library</h1>
        <p>Discover notes, PDFs, and learning materials shared by the community</p>
      </div>

      {/* Search and Filters */}
      <div className="resources-controls">
        <input
          type="text"
          placeholder="🔍 Search resources..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filters-row">
          <div className="filter-group">
            <label>Type:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="pdf">PDFs</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="downloads">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="resources-info">
        <p>{filtered.length} resources found</p>
      </div>

      {/* Resources Grid */}
      <div className="resources-grid">
        {filtered.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <p>😢 No resources match your search. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
