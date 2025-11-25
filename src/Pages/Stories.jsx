import React, { useState, useEffect } from 'react';
import { sampleStories, sampleUsers } from '../data/sampleData';
import '../styles/Stories.css';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState('');
  const [likedStories, setLikedStories] = useState(new Set());

  // Fetch stories from API or use sample data
  useEffect(() => {
    const fetchStories = async () => {
      try {
        // TODO: Uncomment when backend is ready
        // const data = await storiesAPI.getAll({ limit: 50 });
        // setStories(data.stories);
        
        // For now, use sample data
        setStories(sampleStories);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
        // Fallback to sample data
        setStories(sampleStories);
      }
    };

    fetchStories();
  }, []);

  const handleShare = async () => {
    if (newStory.trim()) {
      try {
        // TODO: Uncomment when backend is ready
        // const response = await storiesAPI.create({ content: newStory });
        
        // For now, add locally
        const story = {
          id: `story${Date.now()}`,
          author: 'You',
          authorId: 'user0',
          content: newStory,
          timestamp: new Date(),
          likes: 0,
          comments: 0,
          shares: 0,
          emoji: '✨',
        };
        setStories([story, ...stories]);
        setNewStory('');
      } catch (err) {
        console.error('Failed to share story:', err);
      }
    }
  };

  const toggleLike = async (storyId) => {
    try {
      const newLiked = new Set(likedStories);
      if (newLiked.has(storyId)) {
        // TODO: Uncomment when backend is ready
        // await storiesAPI.unlike(storyId);
        newLiked.delete(storyId);
      } else {
        // TODO: Uncomment when backend is ready
        // await storiesAPI.like(storyId);
        newLiked.add(storyId);
      }
      setLikedStories(newLiked);
    } catch (err) {
      console.error('Failed to update like:', err);
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

  return (
    <div className="stories-page">
      {/* Hero */}
      <div className="stories-hero">
        <h1>📖 Stories & Reflections</h1>
        <p>Share your learning journey, insights, and experiences with the community</p>
      </div>

      {/* Compose */}
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
        />
        <button
          className="btn-share"
          onClick={handleShare}
          disabled={!newStory.trim()}
        >
          Share Story
        </button>
      </div>

      {/* Stories Feed */}
      <div className="stories-feed">
        {stories.map(story => (
          <div key={story.id} className="story-card">
            <div className="story-header">
              <div className="story-author-info">
                <span className="author-avatar">{sampleUsers.find(u => u.id === story.authorId)?.avatar || '👤'}</span>
                <div className="author-details">
                  <p className="author-name">{story.author}</p>
                  <p className="story-time">{formatDate(story.timestamp)}</p>
                </div>
              </div>
            </div>

            <div className="story-content">
              <p>{story.content}</p>
            </div>

            <div className="story-actions">
              <button
                className={`action-btn ${likedStories.has(story.id) ? 'liked' : ''}`}
                onClick={() => toggleLike(story.id)}
              >
                ❤️ {likedStories.has(story.id) ? story.likes + 1 : story.likes}
              </button>
              <button className="action-btn">💬 {story.comments}</button>
              <button className="action-btn">↗️ {story.shares}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
