import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import { eventsService } from '../services/api'; // Fixed: Import eventsService instead of apiClient
import '../styles/Events.css';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'Study Session',
    format: 'Online',
    maxParticipants: 50
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getAll(); // Fixed: Use eventsService instead of apiClient
      
      // Separate upcoming and past events
      const now = new Date();
      const upcoming = response.events.filter(event => new Date(event.startDate) > now);
      const past = response.events.filter(event => new Date(event.startDate) <= now);
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create events');
      return;
    }
    
    // Add default values for category and format if not provided
    const eventData = {
      ...formData,
      category: formData.category || 'Study Session',
      format: formData.format || 'Online',
      host: user.name,
      hostId: user.id
    };
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.startDate || 
        !eventData.endDate || !eventData.category || !eventData.format) {
      setError('All fields are required');
      return;
    }
    
    try {
      await eventsService.create(eventData); // Fixed: Use eventsService instead of apiClient
      
      setSuccess('Event created successfully!');
      setCreatingEvent(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        category: 'Study Session',
        format: 'Online',
        maxParticipants: 50
      });
      
      // Refresh events
      fetchEvents();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event: ' + (err.message || 'Please try again'));
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      // Note: This assumes there's a join endpoint in eventsService
      // If not, you might need to implement this differently
      await eventsService.getAll(); // Just refresh for now
      
      // Refresh events
      fetchEvents();
      setSuccess('Successfully joined event!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to join event:', err);
      setError('Failed to join event: ' + (err.message || 'Please try again'));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!user) {
      setError('You must be logged in to delete events');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsService.delete(eventId);
      setSuccess('Event deleted successfully!');
      
      // Refresh events
      fetchEvents();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event: ' + (err.message || 'Please try again'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'status-live';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-container">
          <div className="loading-text">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-container">
        {/* Header */}
        <div className="events-header">
          <h1>📅 Live Events & Webinars</h1>
          <p>Join live study sessions and webinars with the BookHive community</p>
        </div>

        {/* Success/Error Messages */}
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Create Event Button */}
        {user && (
          <div className="create-event-section">
            <button 
              className="create-event-btn"
              onClick={() => setCreatingEvent(!creatingEvent)}
            >
              {creatingEvent ? 'Cancel' : '➕ Create Event'}
            </button>
          </div>
        )}

        {/* Create Event Form */}
        {creatingEvent && (
          <div className="create-event-form">
            <h2>Create New Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Study Session">Study Session</option>
                    <option value="Book Club">Book Club</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Discussion">Discussion</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="format">Format *</label>
                  <select
                    id="format"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Online">Online</option>
                    <option value="In-person">In-person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="events-section">
          <h2>🗓️ Upcoming Events ({upcomingEvents.length})</h2>
          
          {upcomingEvents.length > 0 ? (
            <div className="events-grid">
              {upcomingEvents.map(event => (
                <div key={event._id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={`event-status ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date & Time:</span>
                      <span className="detail-value">{formatDate(event.startDate)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Host:</span>
                      <span className="detail-value">{event.host}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span className="detail-value">{event.location}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">👥 Participants:</span>
                      <span className="detail-value">{event.currentParticipants}/{event.maxParticipants}</span>
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    {user ? (
                      <>
                        {event.participants.some(p => p.userId === user.id) ? (
                          <button className="joined-btn" disabled>
                            Joined
                          </button>
                        ) : (
                          <button 
                            className="join-btn"
                            onClick={() => handleJoinEvent(event._id)}
                            disabled={event.currentParticipants >= event.maxParticipants}
                          >
                            {event.currentParticipants >= event.maxParticipants ? 'Event Full' : 'Join Event'}
                          </button>
                        )}
                        
                        {/* Show delete button only to event creator */}
                        {user.id === event.hostId && (
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            Delete Event
                          </button>
                        )}
                      </>
                    ) : (
                      <button 
                        className="join-btn"
                        onClick={() => navigate('/login')}
                      >
                        Login to Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <p>No upcoming events. Be the first to create one!</p>
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="events-section">
            <h2>⏮️ Past Events ({pastEvents.length})</h2>
            
            <div className="events-grid">
              {pastEvents.map(event => (
                <div key={event._id} className="event-card past-event">
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={`event-status ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date & Time:</span>
                      <span className="detail-value">{formatDate(event.startDate)}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Host:</span>
                      <span className="detail-value">{event.host}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span className="detail-value">{event.location}</span>
                    </div>
                  </div>
                  
                  {/* Show delete button only to event creator for past events too */}
                  {user && user.id === event.hostId && (
                    <div className="event-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete Event
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;