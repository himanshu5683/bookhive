import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import AuthContext from '../auth/AuthContext';
import '../styles/Stories.css';

const Stories = () => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editingStoryContent, setEditingStoryContent] = useState('');
  const [likedStories, setLikedStories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch stories from backend API
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.storiesAPI.getAll({ limit: 50 });
        setStories(response.stories || []);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
        setError('Failed to load stories. Please try again.');
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleShare = async () => {
    if (!newStory.trim()) return;
    if (!user) {
      setError('Please log in to share a story');
      return;
    }

    setPosting(true);
    setError('');
    try {
      const response = await apiClient.storiesAPI.create({ 
        content: newStory,
        userId: user.id,
        author: user.name
      });
      
      // Log activity for credit award
      try {
        await apiClient.activityAPI.logActivity({
          userId: user.id,
          activityType: 'story',
          content: newStory,
          metadata: {
            storyId: response.story._id
          }
        });
      } catch (activityError) {
        console.error('Failed to log activity:', activityError);
      }
      
      // Add the new story to the top of the list
      setStories([response.story, ...stories]);
      setNewStory('');
    } catch (err) {
      console.error('Failed to share story:', err);
      setError('Failed to share story. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (storyId) => {
    if (!user) {
      setError('Please log in to like stories');
      return;
    }

    try {
      const newLiked = new Set(likedStories);
      if (newLiked.has(storyId)) {
        await apiClient.storiesAPI.unlike(storyId);
        newLiked.delete(storyId);
        // Update story likes count locally
        setStories(stories.map(s => 
          s._id === storyId ? { ...s, likes: Math.max(0, s.likes - 1) } : s
        ));
      } else {
        await apiClient.storiesAPI.like(storyId);
        newLiked.add(storyId);
        // Update story likes count locally
        setStories(stories.map(s => 
          s._id === storyId ? { ...s, likes: s.likes + 1 } : s
        ));
      }
      setLikedStories(newLiked);
    } catch (err) {
      console.error('Failed to update like:', err);
      setError('Failed to update like. Please try again.');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleEdit = (story) => {
    setEditingStoryId(story._id || story.id);
    setEditingStoryContent(story.content);
  };

  const handleCancelEdit = () => {
    setEditingStoryId(null);
    setEditingStoryContent('');
  };

  const handleSaveEdit = async (storyId) => {
    if (!editingStoryContent.trim()) return;
    
    try {
      const response = await apiClient.storiesAPI.update(storyId, { 
        content: editingStoryContent 
      });
      
      // Update story in state
      setStories(stories.map(s => 
        s._id === storyId ? { ...s, content: response.story.content } : s
      ));
      
      // Exit edit mode
      setEditingStoryId(null);
      setEditingStoryContent('');
      
      setError('');
    } catch (err) {
      console.error('Failed to update story:', err);
      setError('Failed to update story. Please try again.');
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    
    try {
      await apiClient.storiesAPI.delete(storyId);
      
      // Remove story from state
      setStories(stories.filter(s => s._id !== storyId));
      
      setError('');
    } catch (err) {
      console.error('Failed to delete story:', err);
      setError('Failed to delete story. Please try again.');
    }
  };

  return (
    <div className="stories-page">
      {/* Hero */}
      <div className="stories-hero">
        <h1>📖 Stories & Reflections</h1>
        <p>Share your learning journey, insights, and experiences with the community</p>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Compose */}
      {user && (
        <div className="story-composer">
          <div className="composer-header">
            <span>✨ Share Your Story</span>
          </div>
          <textarea
            className="story-input"
            placeholder="What's on your mind? Share a learning moment, reflection, or achievement..."
            value={newStory}
            onChange={(e) => setNewStory(e.target.value)}
            rows={4}
            disabled={posting}
          />
          <button
            className="btn-share"
            onClick={handleShare}
            disabled={!newStory.trim() || posting}
          >
            {posting ? 'Sharing...' : 'Share Story'}
          </button>
        </div>
      )}

      {!user && (
        <div className="login-prompt">
          <p>📝 <a href="/login">Log in</a> to share your story with the community</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading stories...</p>
        </div>
      )}

      {/* Stories Feed */}
      {!loading && (
        <div className="stories-feed">
          {stories.length === 0 ? (
            <div className="no-stories">
              <p>No stories yet. Be the first to share!</p>
            </div>
          ) : (
            stories.map(story => (
              <div key={story._id || story.id} className="story-card">
                <div className="story-header">
                  <div className="story-author-info">
                    <span className="author-avatar">👤</span>
                    <div className="author-details">
                      <p className="author-name">{story.author || 'Anonymous'}</p>
                      <p className="story-time">{formatDate(new Date(story.createdAt || story.timestamp))}</p>
                    </div>
                  </div>
                </div>

                <div className="story-content">
                  {editingStoryId === (story._id || story.id) ? (
                    <textarea
                      className="story-edit-input"
                      value={editingStoryContent}
                      onChange={(e) => setEditingStoryContent(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p>{story.content}</p>
                  )}
                </div>

                <div className="story-actions">
                  <button
                    className={`action-btn ${likedStories.has(story._id || story.id) ? 'liked' : ''}`}
                    onClick={() => toggleLike(story._id || story.id)}
                  >
                    ❤️ {story.likes || 0}
                  </button>
                  <button className="action-btn">💬 {story.comments?.length || 0}</button>
                  <button className="action-btn">↗️ {story.shares || 0}</button>
                  
                  {/* Edit/Delete buttons for story owner */}
                  {user && user.id === story.authorId && (
                    <div className="story-owner-actions">
                      {editingStoryId === (story._id || story.id) ? (
                        <>
                          <button 
                            className="btn-save"
                            onClick={() => handleSaveEdit(story._id || story.id)}
                          >
                            Save
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(story)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(story._id || story.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Stories;
