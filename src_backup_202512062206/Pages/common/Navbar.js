// src/Pages/common/Navbar.js - Navigation Bar Component

import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "../../components/LanguageSelector";
import "../../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Determine active route for highlighting
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if we're on a protected route
  const isProtectedRoute = location.pathname.startsWith("/dashboard") || 
                          location.pathname.startsWith("/upload") || 
                          location.pathname.startsWith("/profile") ||
                          location.pathname.startsWith("/ai");

  return (
    <nav className={`navbar-container ${theme}`}>
      <div className="navbar-wrapper">
        {/* Logo */}
        <div className="navbar-left">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">BookHive</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="nav-links">
            <button 
              className={`navbar-link ${isActive("/") ? "active" : ""}`}
              onClick={() => {
                navigate("/");
              }}
            >
              Home
            </button>
            <button 
              className={`navbar-link ${isActive("/resources") ? "active" : ""}`}
              onClick={() => {
                navigate("/resources");
              }}
            >
              Resources
            </button>
            <button 
              className={`navbar-link ${isActive("/stories") ? "active" : ""}`}
              onClick={() => {
                navigate("/stories");
              }}
            >
              Stories
            </button>
            <button 
              className={`navbar-link ${isActive("/circles") ? "active" : ""}`}
              onClick={() => {
                navigate("/circles");
              }}
            >
              Study Circles
            </button>
            <button 
              className={`navbar-link ${isActive("/events") ? "active" : ""}`}
              onClick={() => {
                navigate("/events");
              }}
            >
              Events
            </button>
            <button 
              className={`navbar-link ${isActive("/leaderboard") ? "active" : ""}`}
              onClick={() => {
                navigate("/leaderboard");
              }}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={submitSearch}>
          <input 
            aria-label="Search books" 
            placeholder="Search resources..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          <button className="btn btn-ghost" type="submit">🔍</button>
        </form>

        {/* Right Side Items */}
        <div className="navbar-right">
          <LanguageSelector />
          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationBell />
              <div className="user-menu">
                <button 
                  className="user-avatar"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>
                
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => navigate("/dashboard")}>📊 Dashboard</div>
                    <div className="dropdown-item" onClick={() => navigate("/profile")}>👤 Profile</div>
                    <div className="dropdown-item" onClick={() => navigate("/upload")}>📤 Upload</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => navigate("/ai/recommendations")}>🤖 Recommendations</div>
                    <div className="dropdown-item" onClick={() => navigate("/ai/chat")}>💬 AI Chat</div>
                    <div className="dropdown-item" onClick={() => navigate("/ai/summarize")}>📝 Summarize</div>
                    <div className="dropdown-item" onClick={() => navigate("/ai/search")}>🔍 Smart Search</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => navigate("/notifications")}>🔔 Notifications</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={handleLogout}>🚪 Logout</div>
                  </div>
                )}
              </div>
            </>
          ) : isProtectedRoute ? (
            <button 
              className="navbar-btn navbar-btn-primary" 
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <button 
              className="navbar-btn navbar-btn-primary" 
              onClick={() => navigate("/auth")}
            >
              Get Started
            </button>
          )}
          
          <button 
            className="mobile-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-group">
            <div 
              className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              Home
            </div>
            <div 
              className={`mobile-nav-item ${isActive("/resources") ? "active" : ""}`}
              onClick={() => {
                navigate("/resources");
                setIsMenuOpen(false);
              }}
            >
              Resources
            </div>
            <div 
              className={`mobile-nav-item ${isActive("/stories") ? "active" : ""}`}
              onClick={() => {
                navigate("/stories");
                setIsMenuOpen(false);
              }}
            >
              Story Circles
            </div>
            <div 
              className={`mobile-nav-item ${isActive("/circles") ? "active" : ""}`}
              onClick={() => {
                navigate("/circles");
                setIsMenuOpen(false);
              }}
            >
              Study Circles
            </div>
            <div 
              className={`mobile-nav-item ${isActive("/events") ? "active" : ""}`}
              onClick={() => {
                navigate("/events");
                setIsMenuOpen(false);
              }}
            >
              Events
            </div>
            <div 
              className={`mobile-nav-item ${isActive("/leaderboard") ? "active" : ""}`}
              onClick={() => {
                navigate("/leaderboard");
                setIsMenuOpen(false);
              }}
            >
              Leaderboard
            </div>
          </div>
          
          {user ? (
            <div className="mobile-group mobile-actions">
              <button 
                className="mobile-nav-btn"
                onClick={() => {
                  navigate("/dashboard");
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </button>
              <button 
                className="mobile-nav-btn"
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
              >
                Profile
              </button>
              <button 
                className="mobile-nav-btn"
                onClick={() => {
                  navigate("/upload");
                  setIsMenuOpen(false);
                }}
              >
                Upload
              </button>
              <button 
                className="mobile-nav-btn logout"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-group mobile-actions">
              <button 
                className="mobile-nav-btn primary"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;