// src/Pages/common/NotificationBell.jsx - Notification Bell Component

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import '../../styles/NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification._id);
    
    // Navigate to related content if applicable
    if (notification.relatedId && notification.relatedType) {
      switch (notification.relatedType) {
        case 'resource':
          navigate(`/resources/${notification.relatedId}`);
          break;
        case 'circle':
          navigate(`/circles/${notification.relatedId}`);
          break;
        case 'request':
          navigate(`/requests/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button 
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {recentNotifications.length > 0 ? (
              recentNotifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notification.read && (
                    <span className="unread-indicator"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          <div className="dropdown-footer">
            <button 
              className="view-all-btn"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;