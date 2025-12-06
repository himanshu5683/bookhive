import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Sort notifications based on selected sort option
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    if (sortBy === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id) => {
    await removeNotification(id);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
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
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="container">
          <div className="notifications-header">
            <h1>🔔 Notifications</h1>
            <p>Please log in to view your notifications</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <div className="header-content">
            <h1>🔔 Notifications</h1>
            <p>Stay updated with activities on BookHive</p>
          </div>
          
          {unreadCount > 0 && (
            <div className="header-actions">
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="notifications-filters">
              <div className="filter-group">
                <label>Filter:</label>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All ({notifications.length})</option>
                  <option value="unread">Unread ({unreadCount})</option>
                  <option value="read">Read ({notifications.length - unreadCount})</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {/* Notifications List */}
            {sortedNotifications.length > 0 ? (
              <div className="notifications-list">
                {sortedNotifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
                  >
                    <div 
                      className="notification-content"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon">
                        {notification.type === 'resource' && '📚'}
                        {notification.type === 'circle' && '👥'}
                        {notification.type === 'request' && '📬'}
                        {notification.type === 'system' && '⚙️'}
                        {notification.type === 'achievement' && '🏆'}
                      </div>
                      
                      <div className="notification-details">
                        <h3 className="notification-title">{notification.title}</h3>
                        <p className="notification-message">{notification.message}</p>
                        <div className="notification-meta">
                          <span className="notification-time">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`notification-type ${notification.type}`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          className="action-btn mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-notifications">
                <div className="empty-icon">🔔</div>
                <h3>No notifications found</h3>
                <p>
                  {filter === 'unread' 
                    ? "You don't have any unread notifications." 
                    : "You don't have any notifications yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;