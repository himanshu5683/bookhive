import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { storiesService, activityService } from '../services/api';
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
        const response = await storiesService.getAll({ limit: 50 });
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
      // Generate a title from the first few words of the content
      const content = newStory.trim();
      const title = content.split(' ').slice(0, 5).join(' ') + (content.split(' ').length > 5 ? '...' : '');
      
      const response = await storiesService.create({ 
        title: title || 'My Story',
        content: content,
        author: user.name,
        authorId: user.id
      });
      
      // Log activity for credit award
      try {
        await activityService.log({
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
      const response = await storiesService.like(storyId);
      
      // Check if the response has the success property
      if (!response.success) {
        throw new Error(response.error || 'Failed to update like');
      }
      
      // Update story likes count locally
      setStories(stories.map(s => 
        s._id === storyId ? { ...s, likes: response.likesCount } : s
      ));
      
      // Update liked stories state
      const newLiked = new Set(likedStories);
      if (newLiked.has(storyId)) {
        newLiked.delete(storyId);
      } else {
        newLiked.add(storyId);
      }
      setLikedStories(newLiked);
    } catch (err) {
      console.error('Failed to update like:', err);
      setError('Failed to update like. Please try again.');
    }
  };

  const handleComment = async (storyId, commentContent) => {
    if (!user) {
      setError('Please log in to comment on stories');
      return;
    }

    if (!commentContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await storiesService.comment(storyId, commentContent);
      
      // Check if the response has the success property
      if (!response.success) {
        throw new Error(response.error || 'Failed to add comment');
      }
      
      // Update story comments count locally
      setStories(stories.map(s => 
        s._id === storyId ? { 
          ...s, 
          comments: [...(s.comments || []), response.comment],
          commentCount: (s.commentCount || 0) + 1
        } : s
      ));
      
      setError('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleShareStory = async (storyId) => {
    if (!user) {
      setError('Please log in to share stories');
      return;
    }

    try {
      const response = await storiesService.share(storyId);
      
      // Check if the response has the success property
      if (!response.success) {
        throw new Error(response.error || 'Failed to share story');
      }
      
      // Update story shares count locally
      setStories(stories.map(s => 
        s._id === storyId ? { ...s, shares: response.shareCount } : s
      ));
      
      // Try to use navigator.share if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Check out this story on BookHive',
            text: 'I found this interesting story on BookHive!',
            url: response.shareableUrl
          });
          return;
        } catch (shareErr) {
          console.log('Navigator share failed:', shareErr);
        }
      }
      
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(response.shareableUrl);
        alert('Link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Clipboard copy failed:', clipboardErr);
        // Last resort: show URL in alert
        alert(`Share this link: ${response.shareableUrl}`);
      }
      
      setError('');
    } catch (err) {
      console.error('Failed to share story:', err);
      setError('Failed to share story. Please try again.');
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
      const response = await storiesService.update(storyId, { 
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
      await storiesService.delete(storyId);
      
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
      <motion.div 
        className="stories-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>📖 Stories & Reflections</h1>
        <p>Share your learning journey, insights, and experiences with the community</p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {/* Compose */}
      {user && (
        <motion.div 
          className="story-composer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
          <motion.button
            className="btn-share"
            onClick={handleShare}
            disabled={!newStory.trim() || posting}
            whileHover={{ scale: !(!newStory.trim() || posting) ? 1.05 : 1 }}
            whileTap={{ scale: !(!newStory.trim() || posting) ? 0.95 : 1 }}
          >
            {posting ? 'Sharing...' : 'Share Story'}
          </motion.button>
        </motion.div>
      )}

      {!user && (
        <motion.div 
          className="login-prompt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p>📝 <a href="/login">Log in</a> to share your story with the community</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div 
          className="loading-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>Loading stories...</p>
        </motion.div>
      )}

      {/* Stories Feed */}
      {!loading && (
        <motion.div 
          className="stories-feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {stories.length === 0 ? (
            <motion.div 
              className="no-stories"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p>No stories yet. Be the first to share!</p>
            </motion.div>
          ) : (
            stories.map((story, index) => (
              <motion.div 
                key={story._id || story.id} 
                className="story-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: 'var(--bh-shadow-lg)',
                  transition: { duration: 0.2 }
                }}
              >
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
                  <motion.button
                    className={`action-btn ${likedStories.has(story._id || story.id) ? 'liked' : ''}`}
                    onClick={() => toggleLike(story._id || story.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ❤️ {story.likes || 0}
                  </motion.button>
                  <motion.button 
                    className="action-btn"
                    onClick={() => {
                      const comment = prompt('Enter your comment:');
                      if (comment !== null) {
                        handleComment(story._id || story.id, comment);
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    💬 {story.comments?.length || 0}
                  </motion.button>
                  <motion.button 
                    className="action-btn"
                    onClick={() => handleShareStory(story._id || story.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ↗️ {story.shares || 0}
                  </motion.button>
                  
                  {/* Edit/Delete buttons for story owner */}
                  {user && user.id === story.authorId && (
                    <div className="story-owner-actions">
                      {editingStoryId === (story._id || story.id) ? (
                        <>
                          <motion.button 
                            className="btn-save"
                            onClick={() => handleSaveEdit(story._id || story.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save
                          </motion.button>
                          <motion.button 
                            className="btn-cancel"
                            onClick={handleCancelEdit}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button 
                            className="btn-edit"
                            onClick={() => handleEdit(story)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Edit
                          </motion.button>
                          <motion.button 
                            className="btn-delete"
                            onClick={() => handleDelete(story._id || story.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Stories;