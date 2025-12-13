import React, { useState, useContext, useCallback, useEffect } from "react"; // Fixed: Add missing imports
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { aiService } from "../../services/api"; // Fixed: Import aiService instead of apiClient
import "../../styles/AI.css";

const EventSuggestions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [preferences, setPreferences] = useState({
    interests: "",
    preferredFormats: [],
    availability: "all"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("suggestions");

  const fetchEventSuggestions = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await aiService.eventSuggestions({ // Fixed: Use aiService instead of apiClient
        ...preferences,
        userId: user?.id
      });
      
      setEvents(response.events || []);
    } catch (err) {
      console.error("Event suggestions error:", err);
      setError("Failed to fetch event suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [preferences, user]);

  useEffect(() => {
    fetchEventSuggestions();
  }, [fetchEventSuggestions]);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchEventSuggestions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  const getEventTypeClass = (type) => {
    switch (type) {
      case 'workshop': return 'workshop-event';
      case 'webinar': return 'webinar-event';
      case 'study_group': return 'study-group-event';
      default: return 'general-event';
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🎯 Personalized Event Suggestions</h1>
        <p>Discover events tailored to your interests and schedule</p>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button 
          className={`ai-tab ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          🎯 Suggestions
        </button>
        <button 
          className={`ai-tab ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          ⚙️ Preferences
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === "preferences" ? (
        <div className="preferences-panel card">
          <h2>Customize Your Preferences</h2>
          <div className="preferences-form">
            <div className="form-group">
              <label>Interests & Topics</label>
              <textarea
                value={preferences.interests}
                onChange={(e) => handlePreferenceChange("interests", e.target.value)}
                placeholder="e.g., JavaScript, Machine Learning, Book Clubs..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Preferred Event Formats</label>
              <div className="checkbox-group">
                {["Online", "In-person", "Hybrid"].map(format => (
                  <label key={format} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.preferredFormats.includes(format)}
                      onChange={(e) => {
                        const newFormats = e.target.checked
                          ? [...preferences.preferredFormats, format]
                          : preferences.preferredFormats.filter(f => f !== format);
                        handlePreferenceChange("preferredFormats", newFormats);
                      }}
                    />
                    {format}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Availability</label>
              <select
                value={preferences.availability}
                onChange={(e) => handlePreferenceChange("availability", e.target.value)}
              >
                <option value="all">All Times</option>
                <option value="weekday">Weekdays Only</option>
                <option value="weekend">Weekends Only</option>
                <option value="evening">Evenings Only</option>
              </select>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleRefresh}
            >
              Save Preferences & Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="events-section">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Finding events that match your interests...</p>
            </div>
          ) : (
            <>
              <div className="events-header">
                <h2>Recommended Events</h2>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleRefresh}
                >
                  Refresh Suggestions
                </button>
              </div>
              
              {events.length > 0 ? (
                <div className="events-grid">
                  {events.map((event, index) => (
                    <div key={index} className={`event-card card ${getEventTypeClass(event.type)}`}>
                      <div className="event-header">
                        <h3 className="event-title">{event.title}</h3>
                        <span className="event-type badge">{event.type.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="event-details">
                        <div className="event-date-time">
                          <div className="event-date">📅 {formatDate(event.date)}</div>
                          <div className="event-time">⏰ {formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
                        </div>
                        
                        <div className="event-location">
                          📍 {event.location}
                        </div>
                        
                        {event.format && (
                          <div className="event-format">
                            💻 Format: {event.format.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                      
                      <p className="event-description">{event.description}</p>
                      
                      <div className="event-actions">
                        <button className="btn btn-primary btn-sm">
                          Register
                        </button>
                        <button className="btn btn-outline btn-sm">
                          Add to Calendar
                        </button>
                      </div>
                      
                      {event.matchReason && (
                        <div className="match-reason">
                          <strong>Why this event:</strong> {event.matchReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-events">
                  <div className="empty-icon">📅</div>
                  <h3>No Events Found</h3>
                  <p>We couldn't find any events matching your current preferences.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab("preferences")}
                  >
                    Update Preferences
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSuggestions;