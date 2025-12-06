import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";
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
      const response = await apiClient.aiAPI.eventSuggestions({
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

  const handleFormatToggle = (format) => {
    setPreferences(prev => {
      const formats = prev.preferredFormats.includes(format)
        ? prev.preferredFormats.filter(f => f !== format)
        : [...prev.preferredFormats, format];
      
      return {
        ...prev,
        preferredFormats: formats
      };
    });
  };

  const handleRefresh = () => {
    fetchEventSuggestions();
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventTypeClass = (type) => {
    switch (type) {
      case "book_club": return "event-book-club";
      case "author_meet": return "event-author-meet";
      case "workshop": return "event-workshop";
      case "discussion": return "event-discussion";
      default: return "";
    }
  };

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h1>🎉 AI Event Suggestions</h1>
        <p>Discover book-related events tailored to your interests</p>
      </div>

      <div className="event-tabs">
        <button 
          className={`tab-btn ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          Suggestions
        </button>
        <button 
          className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          My Preferences
        </button>
      </div>

      {activeTab === "preferences" ? (
        <div className="preferences-section card">
          <h2>Your Event Preferences</h2>
          <form className="ai-form">
            <div className="form-group">
              <label htmlFor="interests">Your Interests</label>
              <input
                id="interests"
                type="text"
                value={preferences.interests}
                onChange={(e) => handlePreferenceChange("interests", e.target.value)}
                placeholder="e.g., Science Fiction, Mystery, Biography"
              />
            </div>
            
            <div className="form-group">
              <label>Preferred Event Formats</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.preferredFormats.includes("virtual")}
                    onChange={() => handleFormatToggle("virtual")}
                  />
                  <span className="checkmark"></span>
                  Virtual Events
                </label>
                
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.preferredFormats.includes("in_person")}
                    onChange={() => handleFormatToggle("in_person")}
                  />
                  <span className="checkmark"></span>
                  In-Person Events
                </label>
                
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.preferredFormats.includes("hybrid")}
                    onChange={() => handleFormatToggle("hybrid")}
                  />
                  <span className="checkmark"></span>
                  Hybrid Events
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                value={preferences.availability}
                onChange={(e) => handlePreferenceChange("availability", e.target.value)}
              >
                <option value="all">Any Time</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="evenings">Evenings</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleRefresh}
              >
                Save & Refresh
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="events-section">
          {error && <div className="alert alert-error">{error}</div>}

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
                <div className="no-results">
                  <div className="no-results-icon">📅</div>
                  <h3>No events found</h3>
                  <p>We couldn't find any events matching your preferences. Try adjusting your settings.</p>
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

      {/* Back to AI Dashboard */}
      <div className="back-to-dashboard">
        <button 
          className="btn btn-outline"
          onClick={() => navigate("/ai")}
        >
          ← Back to AI Dashboard
        </button>
      </div>
    </div>
  );
};

export default EventSuggestions;