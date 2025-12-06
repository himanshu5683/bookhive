import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import AuthContext from '../auth/AuthContext';
import '../styles/StudyCircles.css';

const StudyCircles = () => {
  const { user } = useContext(AuthContext);
  const [circles, setCircles] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [showCreateCircleForm, setShowCreateCircleForm] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', topic: '', description: '' });
  const [replyingToThread, setReplyingToThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch circles from backend API
  useEffect(() => {
    const fetchCircles = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.circlesAPI.getAll();
        setCircles(response.circles || []);
      } catch (err) {
        console.error('Failed to fetch circles:', err);
        setError('Failed to load study circles. Please try again.');
        setCircles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, []);

  const toggleJoin = async (circleId) => {
    if (!user) {
      setError('Please log in to join circles');
      return;
    }

    try {
      const newJoined = new Set(joined);
      if (newJoined.has(circleId)) {
        // Leave circle (if API supports it)
        newJoined.delete(circleId);
        // Update member count locally
        setCircles(circles.map(c => 
          c._id === circleId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
        ));
      } else {
        // Join circle via API
        await apiClient.circlesAPI.join(circleId);
        newJoined.add(circleId);
        // Update member count locally
        setCircles(circles.map(c => 
          c._id === circleId ? { ...c, memberCount: c.memberCount + 1 } : c
        ));
      }
      setJoined(newJoined);
    } catch (err) {
      console.error('Failed to join circle:', err);
      setError('Failed to join circle. Please try again.');
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    try {
      await apiClient.circlesAPI.createThread(selectedCircle._id, {
        ...newThread,
        userId: user.id
      });
      setNewThread({ title: '', content: '' });
      setShowThreadForm(false);
      // Refresh circle details
      const response = await apiClient.circlesAPI.getById(selectedCircle._id);
      setSelectedCircle(response.circle);
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError('Failed to create thread. Please try again.');
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircle.name.trim() || !newCircle.topic.trim() || !newCircle.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await apiClient.circlesAPI.create({
        ...newCircle,
        creatorId: user.id
      });
      
      // Add new circle to list
      setCircles([response.circle, ...circles]);
      
      // Reset form
      setNewCircle({ name: '', topic: '', description: '' });
      setShowCreateCircleForm(false);
      
      setError('');
    } catch (err) {
      console.error('Failed to create circle:', err);
      setError('Failed to create circle. Please try again.');
    }
  };

  const handleReply = async (threadId) => {
    if (!replyContent.trim()) {
      setError('Please enter a reply');
      return;
    }

    try {
      await apiClient.circlesAPI.replyToThread(selectedCircle._id, threadId, {
        userId: user.id,
        content: replyContent
      });
      
      // Reset reply form
      setReplyingToThread(null);
      setReplyContent('');
      
      setError('');
    } catch (err) {
      console.error('Failed to post reply:', err);
      setError('Failed to post reply. Please try again.');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="study-circles-page">
      {/* Hero */}
      <div className="circles-hero">
        <h1>👥 Study Circles</h1>
        <p>Join subject-based groups to learn, discuss, and share resources with like-minded people</p>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Create Circle Button */}
      {user && (
        <div className="create-circle-section">
          {showCreateCircleForm ? (
            <div className="create-circle-form">
              <h3>Create New Study Circle</h3>
              <input
                type="text"
                placeholder="Circle name..."
                value={newCircle.name}
                onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Topic (e.g., Programming, Mathematics)..."
                value={newCircle.topic}
                onChange={(e) => setNewCircle({ ...newCircle, topic: e.target.value })}
              />
              <textarea
                placeholder="Description..."
                value={newCircle.description}
                onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                rows={3}
              />
              <div className="form-actions">
                <button className="btn btn-create" onClick={handleCreateCircle}>Create Circle</button>
                <button className="btn btn-cancel" onClick={() => {
                  setShowCreateCircleForm(false);
                  setNewCircle({ name: '', topic: '', description: '' });
                }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="btn btn-create-circle"
              onClick={() => setShowCreateCircleForm(true)}
            >
              + Create New Circle
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading study circles...</p>
        </div>
      )}

      {!loading && selectedCircle ? (
        <div className="circle-detail">
          <button className="btn-back" onClick={() => setSelectedCircle(null)}>← Back</button>
          <div className="detail-header">
            <h2>{selectedCircle.name}</h2>
            <p>{selectedCircle.description}</p>
            <div className="detail-stats">
              <span>👥 {selectedCircle.memberCount || selectedCircle.members?.length || 0} members</span>
              <span>💬 {selectedCircle.threads?.length || 0} discussions</span>
              <span>🔄 Active {formatDate(new Date(selectedCircle.updatedAt || selectedCircle.createdAt))}</span>
            </div>
            <button
              className={`btn ${joined.has(selectedCircle._id) ? 'btn-joined' : 'btn-join'}`}
              onClick={() => toggleJoin(selectedCircle._id)}
            >
              {joined.has(selectedCircle._id) ? '✓ Joined' : 'Join Circle'}
            </button>
          </div>

          {/* Create Thread Form */}
          {user && joined.has(selectedCircle._id) && (
            <div className="create-thread-section">
              {showThreadForm ? (
                <div className="thread-form">
                  <input
                    type="text"
                    placeholder="Thread title..."
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Thread content..."
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    rows={4}
                  />
                  <div className="thread-form-actions">
                    <button className="btn btn-create" onClick={handleCreateThread}>Create Thread</button>
                    <button className="btn btn-cancel" onClick={() => setShowThreadForm(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-new-thread" onClick={() => setShowThreadForm(true)}>
                  + Start New Discussion
                </button>
              )}
            </div>
          )}

          {/* Discussion Threads */}
          <div className="threads-section">
            <h3>Recent Discussions</h3>
            <div className="thread-list">
              {selectedCircle.threads?.length > 0 ? (
                selectedCircle.threads.map(thread => (
                  <div key={thread._id || thread.id} className="thread-item">
                    <p className="thread-title">{thread.title}</p>
                    <p className="thread-content">{thread.content}</p>
                    <p className="thread-meta">📝 Started by {thread.author || 'User'} • {formatDate(new Date(thread.createdAt))}</p>
                                    
                    {/* Reply form */}
                    {user && joined.has(selectedCircle._id) && (
                      <div className="reply-section">
                        {replyingToThread === (thread._id || thread.id) ? (
                          <div className="reply-form">
                            <textarea
                              placeholder="Write your reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={3}
                            />
                            <div className="reply-form-actions">
                              <button 
                                className="btn btn-reply"
                                onClick={() => handleReply(thread._id || thread.id)}
                              >
                                Post Reply
                              </button>
                              <button 
                                className="btn btn-cancel"
                                onClick={() => {
                                  setReplyingToThread(null);
                                  setReplyContent('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-reply-toggle"
                            onClick={() => setReplyingToThread(thread._id || thread.id)}
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-threads">No discussions yet. Start one!</p>
              )}
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="circles-grid">
          {circles.length === 0 ? (
            <div className="no-circles">
              <p>No study circles available yet.</p>
            </div>
          ) : (
            circles.map(circle => (
              <div
                key={circle._id || circle.id}
                className="circle-card"
                onClick={() => setSelectedCircle(circle)}
              >
                <h3>{circle.name}</h3>
                <p className="circle-topic">{circle.topic}</p>
                <p className="circle-description">{circle.description}</p>

                <div className="circle-stats">
                  <span>👥 {circle.memberCount || circle.members?.length || 0}</span>
                  <span>💬 {circle.threads?.length || 0}</span>
                </div>

                <button
                  className={`btn ${joined.has(circle._id) ? 'btn-joined' : 'btn-join'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleJoin(circle._id);
                  }}
                >
                  {joined.has(circle._id) ? '✓ Joined' : 'Join'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudyCircles;
