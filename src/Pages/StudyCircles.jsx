import React, { useState, useEffect } from 'react';
import { sampleStudyCircles } from '../data/sampleData';
import '../styles/StudyCircles.css';

const StudyCircles = () => {
  const [circles, setCircles] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Fetch circles from API or use sample data
  useEffect(() => {
    const fetchCircles = async () => {
      try {
        // TODO: Uncomment when backend is ready
        // const data = await circlesAPI.getAll();
        // setCircles(data.circles);
        
        // For now, use sample data
        setCircles(sampleStudyCircles);
      } catch (err) {
        console.error('Failed to fetch circles:', err);
        // Fallback to sample data
        setCircles(sampleStudyCircles);
      }
    };

    fetchCircles();
  }, []);

  const toggleJoin = async (circleId) => {
    try {
      const newJoined = new Set(joined);
      if (newJoined.has(circleId)) {
        newJoined.delete(circleId);
      } else {
        // TODO: Uncomment when backend is ready
        // await circlesAPI.join(circleId);
        newJoined.add(circleId);
      }
      setJoined(newJoined);
    } catch (err) {
      console.error('Failed to join circle:', err);
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

      {selectedCircle ? (
        <div className="circle-detail">
          <button className="btn-back" onClick={() => setSelectedCircle(null)}>← Back</button>
          <div className="detail-header">
            <h2>{selectedCircle.emoji} {selectedCircle.name}</h2>
            <p>{selectedCircle.description}</p>
            <div className="detail-stats">
              <span>👥 {selectedCircle.members} members</span>
              <span>💬 {selectedCircle.threads} discussions</span>
              <span>🔄 Active {formatDate(selectedCircle.lastActive)}</span>
            </div>
            <button
              className={`btn ${joined.has(selectedCircle.id) ? 'btn-joined' : 'btn-join'}`}
              onClick={() => toggleJoin(selectedCircle.id)}
            >
              {joined.has(selectedCircle.id) ? '✓ Joined' : 'Join Circle'}
            </button>
          </div>

          {/* Discussion Threads */}
          <div className="threads-section">
            <h3>Recent Discussions</h3>
            <div className="thread-list">
              <div className="thread-item">
                <p className="thread-title">Best practices for code organization</p>
                <p className="thread-meta">📝 Started by John • 2h ago • 14 replies</p>
              </div>
              <div className="thread-item">
                <p className="thread-title">How to ace technical interviews?</p>
                <p className="thread-meta">📝 Started by Sarah • 5h ago • 28 replies</p>
              </div>
              <div className="thread-item">
                <p className="thread-title">Resource recommendations for beginners</p>
                <p className="thread-meta">📝 Started by Mike • 1d ago • 42 replies</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="circles-grid">
          {circles.map(circle => (
            <div
              key={circle.id}
              className="circle-card"
              onClick={() => setSelectedCircle(circle)}
            >
              <div className="circle-emoji">{circle.emoji}</div>
              <h3>{circle.name}</h3>
              <p className="circle-topic">{circle.topic}</p>
              <p className="circle-description">{circle.description}</p>

              <div className="circle-stats">
                <span>👥 {circle.members}</span>
                <span>💬 {circle.threads}</span>
              </div>

              <button
                className={`btn ${joined.has(circle.id) ? 'btn-joined' : 'btn-join'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleJoin(circle.id);
                }}
              >
                {joined.has(circle.id) ? '✓ Joined' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyCircles;
