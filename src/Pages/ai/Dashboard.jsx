import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AI.css";

const AIDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommendations");

  // Mock data for demonstration
  const mockRecommendations = [
    {
      title: "The Art of Computer Programming",
      author: "Donald Knuth",
      description: "Fundamental algorithms and combinatorial algorithms",
      genre: "Computer Science",
      reasoning: "Based on your interest in algorithms and data structures"
    },
    {
      title: "Clean Code",
      author: "Robert Martin",
      description: "A handbook of agile software craftsmanship",
      genre: "Programming",
      reasoning: "Recommended for your software engineering interests"
    },
    {
      title: "Design Patterns",
      author: "Gang of Four",
      description: "Elements of reusable object-oriented software",
      genre: "Software Engineering",
      reasoning: "Matches your interest in software architecture"
    }
  ];

  const mockTrendingTopics = [
    "Machine Learning", "Web Development", "Data Science", 
    "Cybersecurity", "Mobile Apps", "Cloud Computing"
  ];

  return (
    <div className="ai-dashboard">
      <div className="ai-header">
        <h1>🤖 AI Learning Assistant</h1>
        <p>Your personalized artificial intelligence companion for learning</p>
      </div>

      <div className="ai-dashboard-content">
        {/* Sidebar Navigation */}
        <div className="ai-sidebar">
          <nav className="ai-nav">
            <button 
              className={`ai-nav-item ${activeTab === "recommendations" ? "active" : ""}`}
              onClick={() => setActiveTab("recommendations")}
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">Recommendations</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => navigate("/ai/chat")}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-text">AI Chat</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "search" ? "active" : ""}`}
              onClick={() => navigate("/ai/search")}
            >
              <span className="nav-icon">🔍</span>
              <span className="nav-text">Smart Search</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "summarize" ? "active" : ""}`}
              onClick={() => navigate("/ai/summarize")}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-text">Summarizer</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "auto-tag" ? "active" : ""}`}
              onClick={() => navigate("/ai/auto-tag")}
            >
              <span className="nav-icon">🏷️</span>
              <span className="nav-text">Auto-Tagging</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "trend-detection" ? "active" : ""}`}
              onClick={() => navigate("/ai/trend-detection")}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Trend Detection</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "sentiment" ? "active" : ""}`}
              onClick={() => navigate("/ai/sentiment")}
            >
              <span className="nav-icon">🧠</span>
              <span className="nav-text">Sentiment Analysis</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "event-suggestions" ? "active" : ""}`}
              onClick={() => navigate("/ai/event-suggestions")}
            >
              <span className="nav-icon">🎉</span>
              <span className="nav-text">Event Suggestions</span>
            </button>
            
            <button 
              className={`ai-nav-item ${activeTab === "insights" ? "active" : ""}`}
              onClick={() => setActiveTab("insights")}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Learning Insights</span>
            </button>
          </nav>
        </div>
        {/* Main Content Area */}
        <div className="ai-main-content">
          {activeTab === "recommendations" && (
            <div className="recommendations-view">
              <div className="section-header">
                <h2>Personalized Book Recommendations</h2>
                <p>AI-powered suggestions based on your interests and activity</p>
              </div>
              
              <div className="recommendations-grid">
                {mockRecommendations.map((book, index) => (
                  <div key={index} className="recommendation-card card">
                    <div className="book-cover">
                      <div className="cover-placeholder">📚</div>
                    </div>
                    <div className="book-info">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-genre">{book.genre}</p>
                      <p className="book-description">{book.description}</p>
                      <div className="recommendation-reason">
                        <span className="reason-icon">💡</span>
                        <span className="reason-text">{book.reasoning}</span>
                      </div>
                      <div className="book-actions">
                        <button className="btn btn-primary btn-sm">
                          View Details
                        </button>
                        <button className="btn btn-secondary btn-sm">
                          Save for Later
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "insights" && (
            <div className="insights-view">
              <div className="section-header">
                <h2>Learning Insights</h2>
                <p>AI-analyzed trends and personalized learning analytics</p>
              </div>
              
              <div className="insights-grid">
                <div className="insight-card card">
                  <div className="insight-header">
                    <h3>📚 Your Learning Patterns</h3>
                  </div>
                  <div className="insight-content">
                    <p>You tend to explore <strong>Computer Science</strong> and <strong>Programming</strong> topics most frequently.</p>
                    <div className="learning-chart">
                      <div className="chart-bar">
                        <span className="chart-label">Computer Science</span>
                        <div className="bar-fill" style={{width: "85%"}}></div>
                      </div>
                      <div className="chart-bar">
                        <span className="chart-label">Programming</span>
                        <div className="bar-fill" style={{width: "78%"}}></div>
                      </div>
                      <div className="chart-bar">
                        <span className="chart-label">Mathematics</span>
                        <div className="bar-fill" style={{width: "62%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="insight-card card">
                  <div className="insight-header">
                    <h3>🔥 Trending Topics</h3>
                  </div>
                  <div className="insight-content">
                    <div className="trending-topics">
                      {mockTrendingTopics.map((topic, index) => (
                        <span key={index} className="trending-tag badge badge-primary">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="insight-card card">
                  <div className="insight-header">
                    <h3>🎯 Learning Goals</h3>
                  </div>
                  <div className="insight-content">
                    <p>Based on your activity, we recommend focusing on:</p>
                    <ul className="goals-list">
                      <li>Advanced Data Structures</li>
                      <li>System Design Principles</li>
                      <li>Cloud Architecture</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;