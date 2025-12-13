import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import { requestsService, feedbackService } from '../services/api'; // Fixed: Import proper services instead of apiClient
import '../styles/RequestFeedback.css';

const RequestFeedback = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    category: 'Programming'
  });
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug',
    title: '',
    description: ''
  });
  
  const categories = ['Programming', 'Science', 'Mathematics', 'Technology', 'Business', 'Arts', 'Languages', 'Other'];
  const feedbackTypes = ['bug', 'feature', 'improvement', 'other'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'requests') {
          const response = await apiClient.requestsAPI.getAll();
          setRequests(response.requests || []);
        } else {
          const response = await apiClient.feedbackAPI.getAll();
          setFeedbacks(response.feedbacks || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to submit requests');
      return;
    }

    if (!requestForm.title.trim() || !requestForm.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await apiClient.requestsAPI.create({
        ...requestForm,
        requesterId: user.id,
        requesterName: user.name
      });
      
      // Add to local list
      setRequests([response.request, ...requests]);
      
      // Reset form
      setRequestForm({ title: '', description: '', category: 'Programming' });
      setError('');
    } catch (err) {
      console.error('Failed to submit request:', err);
      setError('Failed to submit request. Please try again.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to submit feedback');
      return;
    }

    if (!feedbackForm.title.trim() || !feedbackForm.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await apiClient.feedbackAPI.create({
        ...feedbackForm,
        userId: user.id,
        userName: user.name
      });
      
      // Add to local list
      setFeedbacks([response.feedback, ...feedbacks]);
      
      // Reset form
      setFeedbackForm({ type: 'bug', title: '', description: '' });
      setError('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again.');
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
    <div className="request-feedback-page">
      {/* Hero */}
      <div className="rf-hero">
        <h1>📬 Requests & Feedback</h1>
        <p>Help us improve BookHive by requesting resources or sharing your thoughts</p>
      </div>

      {/* Tabs */}
      <div className="rf-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Resource Requests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Forms */}
      <div className="rf-forms">
        {activeTab === 'requests' ? (
          <div className="form-section">
            <h2>Request a Resource</h2>
            <p>Can't find what you're looking for? Request it here!</p>
            
            <form onSubmit={handleRequestSubmit} className="rf-form">
              <div className="form-group">
                <label htmlFor="request-title">Resource Title</label>
                <input
                  type="text"
                  id="request-title"
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                  placeholder="e.g., Advanced JavaScript Patterns"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="request-category">Category</label>
                <select
                  id="request-category"
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({...requestForm, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="request-description">Description</label>
                <textarea
                  id="request-description"
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  placeholder="Describe what you're looking for..."
                  rows={4}
                />
              </div>
              
              <button type="submit" className="btn-submit">
                Submit Request
              </button>
            </form>
          </div>
        ) : (
          <div className="form-section">
            <h2>Send Feedback</h2>
            <p>Help us improve BookHive with your suggestions and bug reports</p>
            
            <form onSubmit={handleFeedbackSubmit} className="rf-form">
              <div className="form-group">
                <label htmlFor="feedback-type">Feedback Type</label>
                <select
                  id="feedback-type"
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                >
                  {feedbackTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="feedback-title">Subject</label>
                <input
                  type="text"
                  id="feedback-title"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                  placeholder="Briefly describe your feedback"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="feedback-description">Details</label>
                <textarea
                  id="feedback-description"
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                  placeholder="Please provide detailed information..."
                  rows={5}
                />
              </div>
              
              <button type="submit" className="btn-submit">
                Send Feedback
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="rf-lists">
        <h2>{activeTab === 'requests' ? 'Recent Requests' : 'Recent Feedback'}</h2>
        
        {loading ? (
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="requests-list">
            {requests.length === 0 ? (
              <p className="no-items">No requests yet. Be the first to request a resource!</p>
            ) : (
              requests.map(request => (
                <div key={request._id} className="request-item">
                  <div className="request-header">
                    <h3>{request.title}</h3>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="request-description">{request.description}</p>
                  <div className="request-meta">
                    <span>🏷️ {request.category}</span>
                    <span>👤 {request.requesterName}</span>
                    <span>🕒 {formatDate(new Date(request.createdAt))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.length === 0 ? (
              <p className="no-items">No feedback yet. Share your thoughts!</p>
            ) : (
              feedbacks.map(feedback => (
                <div key={feedback._id} className="feedback-item">
                  <div className="feedback-header">
                    <h3>{feedback.title}</h3>
                    <span className={`type-badge type-${feedback.type}`}>
                      {feedback.type}
                    </span>
                  </div>
                  <p className="feedback-description">{feedback.description}</p>
                  <div className="feedback-meta">
                    <span>👤 {feedback.userName}</span>
                    <span>🕒 {formatDate(new Date(feedback.createdAt))}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestFeedback;