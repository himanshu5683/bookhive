import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../auth/AuthContext';
import { circlesService } from '../services/api'; // Fixed: Import circlesService instead of studyCirclesService
import '../styles/StudyCircles.css';

const StudyCircles = () => {
  const { user } = useContext(AuthContext);
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateCircleForm, setShowCreateCircleForm] = useState(false);
  const [newCircle, setNewCircle] = useState({ name: '', topic: '', description: '' });
  const [replyContent, setReplyContent] = useState('');
  const [replyingToThread, setReplyingToThread] = useState(null); // Add this state

  // Fetch circles from backend API
  useEffect(() => {
    const fetchCircles = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await circlesService.getAll(); // Fixed: Use circlesService instead of studyCirclesService
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

  const handleSelectCircle = async (circle) => {
    setSelectedCircle(circle);
    try {
      const response = await circlesService.getById(circle._id); // Fixed: Use circlesService instead of studyCirclesService
      setSelectedCircle(response);
    } catch (err) {
      console.error('Failed to fetch circle details:', err);
      setError('Failed to load circle details. Please try again.');
    }
  };

  const handleJoinCircle = async (circleId) => {
    try {
      await circlesService.join(circleId); // Fixed: Use circlesService instead of studyCirclesService
      // Refresh the circle data
      const response = await circlesService.getById(circleId); // Fixed: Use circlesService instead of studyCirclesService
      setSelectedCircle(response);
      // Also refresh the circles list
      const circlesResponse = await circlesService.getAll(); // Fixed: Use circlesService instead of studyCirclesService
      setCircles(circlesResponse.circles || []);
    } catch (err) {
      console.error('Failed to join circle:', err);
      setError('Failed to join circle. Please try again.');
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    try {
      await circlesService.createThread(selectedCircle._id, { title, content }); // Fixed: Use circlesService instead of studyCirclesService
      // Refresh the circle data
      const response = await circlesService.getById(selectedCircle._id); // Fixed: Use circlesService instead of studyCirclesService
      setSelectedCircle(response);
      // Reset form
      e.target.reset();
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError('Failed to create thread. Please try again.');
    }
  };

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    if (!newCircle.name || !newCircle.topic) {
      setError('Name and topic are required');
      return;
    }

    try {
      const response = await circlesService.create({ // Fixed: Use circlesService instead of studyCirclesService
        ...newCircle
      });
      // Add the new circle to the list
      setCircles([...circles, response.circle]);
      // Reset form and hide it
      setNewCircle({ name: '', topic: '', description: '' });
      setShowCreateCircleForm(false);
    } catch (err) {
      console.error('Failed to create circle:', err);
      setError('Failed to create circle. Please try again.');
    }
  };

  const handleReplyToThread = async (threadId) => {
    if (!replyContent.trim()) {
      setError('Reply content is required');
      return;
    }

    try {
      await circlesService.replyToThread(selectedCircle._id, threadId, { // Fixed: Use circlesService instead of studyCirclesService
        content: replyContent
      });
      // Refresh the circle data
      const response = await circlesService.getById(selectedCircle._id); // Fixed: Use circlesService instead of studyCirclesService
      setSelectedCircle(response);
      // Reset reply content
      setReplyContent('');
      setReplyingToThread(null);
    } catch (err) {
      console.error('Failed to reply to thread:', err);
      setError('Failed to reply to thread. Please try again.');
    }
  };

  const handleDeleteCircle = async (circleId) => {
    if (!user) {
      setError('You must be logged in to delete circles');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this circle? This action cannot be undone.')) {
      return;
    }

    try {
      await circlesService.delete(circleId);
      setSuccess('Circle deleted successfully!');
      
      // Remove the circle from the list
      setCircles(circles.filter(circle => circle._id !== circleId));
      
      // If the deleted circle was selected, clear the selection
      if (selectedCircle && selectedCircle._id === circleId) {
        setSelectedCircle(null);
      }
      
      setSuccess('Circle deleted successfully!');
    } catch (err) {
      console.error('Failed to delete circle:', err);
      setError('Failed to delete circle: ' + (err.message || 'Please try again.'));
    }
  };

  const [success, setSuccess] = useState('');

  if (loading) {
    return <div className="study-circles-loading">Loading study circles...</div>;
  }

  return (
    <div className="study-circles-container">
      <div className="study-circles-header">
        <h1>📚 Study Circles</h1>
        <p>Join communities of learners with similar interests</p>
      </div>

      {success && <div className="study-circles-success">{success}</div>}
      {error && <div className="study-circles-error">{error}</div>}

      <div className="study-circles-layout">
        {/* Circles List */}
        <div className="circles-list">
          <div className="circles-list-header">
            <h2>All Circles</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateCircleForm(!showCreateCircleForm)}
            >
              {showCreateCircleForm ? 'Cancel' : 'Create Circle'}
            </button>
          </div>

          {showCreateCircleForm && (
            <form onSubmit={handleCreateCircle} className="create-circle-form">
              <h3>Create New Circle</h3>
              <div className="form-group">
                <label htmlFor="circleName">Circle Name</label>
                <input
                  type="text"
                  id="circleName"
                  value={newCircle.name}
                  onChange={(e) => setNewCircle({...newCircle, name: e.target.value})}
                  placeholder="Enter circle name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="circleTopic">Topic</label>
                <input
                  type="text"
                  id="circleTopic"
                  value={newCircle.topic}
                  onChange={(e) => setNewCircle({...newCircle, topic: e.target.value})}
                  placeholder="Enter topic (e.g., Mathematics, Programming)"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="circleDescription">Description</label>
                <textarea
                  id="circleDescription"
                  value={newCircle.description}
                  onChange={(e) => setNewCircle({...newCircle, description: e.target.value})}
                  placeholder="Describe your circle..."
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">Create Circle</button>
            </form>
          )}

          {circles.length === 0 ? (
            <p>No study circles available yet.</p>
          ) : (
            <div className="circles-grid">
              {circles.map((circle) => (
                <div 
                  key={circle._id} 
                  className={`circle-card ${selectedCircle?._id === circle._id ? 'selected' : ''}`}
                  onClick={() => handleSelectCircle(circle)}
                >
                  <h3>{circle.name}</h3>
                  <p className="circle-topic">{circle.topic}</p>
                  <p className="circle-description">{circle.description || 'No description provided'}</p>
                  <div className="circle-meta">
                    <span>👥 {circle.memberCount || 0} members</span>
                    <span>💬 {circle.threadCount || 0} discussions</span>
                  </div>
                  
                  {/* Show delete button only to circle creator */}
                  {user && user.id === circle.createdBy && (
                    <button 
                      className="btn btn-danger delete-circle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCircle(circle._id);
                      }}
                    >
                      Delete Circle
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Circle Details */}
        <div className="circle-details">
          {selectedCircle ? (
            <>
              <div className="circle-header">
                <h2>{selectedCircle.name}</h2>
                <p className="circle-topic">{selectedCircle.topic}</p>
                <p className="circle-description">{selectedCircle.description || 'No description provided'}</p>
                
                {!selectedCircle.members?.some(member => member.userId === user?.id) ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleJoinCircle(selectedCircle._id)}
                  >
                    Join Circle
                  </button>
                ) : (
                  <span className="member-status">✅ You're a member</span>
                )}
                
                <div className="circle-stats">
                  <span>👥 {selectedCircle.memberCount || 0} members</span>
                  <span>💬 {selectedCircle.threadCount || 0} discussions</span>
                </div>
                
                {/* Show delete button only to circle creator in details view */}
                {user && user.id === selectedCircle.createdBy && (
                  <button 
                    className="btn btn-danger delete-circle-btn"
                    onClick={() => handleDeleteCircle(selectedCircle._id)}
                  >
                    Delete Circle
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="members-section">
                <h3>Members</h3>
                <div className="members-list">
                  {selectedCircle.members?.map((member) => (
                    <div key={member.userId} className="member-item">
                      <span className="member-avatar">👤</span>
                      <span className="member-name">{member.name}</span>
                      <span className="member-joined">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threads Section */}
              <div className="threads-section">
                <div className="threads-header">
                  <h3>Discussions</h3>
                  <form onSubmit={handleCreateThread} className="create-thread-form">
                    <h4>Create New Discussion</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        name="title"
                        placeholder="Discussion title"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        name="content"
                        placeholder="What would you like to discuss?"
                        rows="3"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary">Post Discussion</button>
                  </form>
                </div>

                <div className="threads-list">
                  {selectedCircle.threads?.length > 0 ? (
                    selectedCircle.threads.map((thread) => (
                      <div key={thread._id} className="thread-item">
                        <div className="thread-header">
                          <h4>{thread.title}</h4>
                          <span className="thread-author">
                            by {thread.authorName} on {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="thread-content">{thread.content}</p>
                        
                        {/* Replies */}
                        <div className="thread-replies">
                          {thread.replies?.map((reply, index) => (
                            <div key={index} className="reply-item">
                              <div className="reply-header">
                                <span className="reply-author">{reply.authorName}</span>
                                <span className="reply-date">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="reply-content">{reply.content}</p>
                            </div>
                          ))}
                          
                          {/* Reply Form */}
                          {replyingToThread === thread._id ? (
                            <div className="reply-form">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                rows="3"
                              />
                              <div className="reply-form-actions">
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => handleReplyToThread(thread._id)}
                                >
                                  Post Reply
                                </button>
                                <button 
                                  className="btn btn-secondary"
                                  onClick={() => setReplyingToThread(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-secondary reply-button"
                              onClick={() => setReplyingToThread(thread._id)}
                            >
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No discussions yet. Be the first to start one!</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-circle-selected">
              <p>Select a study circle to view details and discussions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyCircles;