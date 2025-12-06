// src/Pages/common/Navbar.js - Modern Navigation Bar Component

import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "../../components/LanguageSelector";
import SmartSearchBar from "../../components/SmartSearchBar";
import "../../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);
  const resourcesDropdownRef = useRef(null);
  const communityDropdownRef = useRef(null);
  const aiDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target)) {
        setIsResourcesDropdownOpen(false);
      }
      if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target)) {
        setIsCommunityDropdownOpen(false);
      }
      if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target)) {
        setIsAIDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Determine active route for highlighting
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items grouped logically
  const mainNavItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Resources", path: "/resources", icon: "📚" },
    { name: "Stories", path: "/stories", icon: "📖" },
    { name: "Study Circles", path: "/circles", icon: "👥" },
    { name: "Events", path: "/events", icon: "📅" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" }
  ];

  const resourceSubItems = [
    { name: "Browse Resources", path: "/resources", icon: "🔍" },
    { name: "Upload Resource", path: "/upload", icon: "📤" },
    { name: "My Files", path: "/files", icon: "📁" }
  ];

  const communitySubItems = [
    { name: "Study Circles", path: "/circles", icon: "👥" },
    { name: "Events", path: "/events", icon: "📅" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" }
  ];

  const aiSubItems = [
    { name: "AI Dashboard", path: "/ai", icon: "🤖" },
    { name: "AI Recommendations", path: "/ai/recommendations", icon: "📚" },
    { name: "AI Chat Assistant", path: "/ai/chat", icon: "💬" },
    { name: "Content Summarizer", path: "/ai/summarize", icon: "📝" },
    { name: "Smart Search", path: "/ai/search", icon: "🔍" },
    { name: "Auto-Tagging", path: "/ai/auto-tag", icon: "🏷️" },
    { name: "Trend Detection", path: "/ai/trend-detection", icon: "📈" },
    { name: "Sentiment Analysis", path: "/ai/sentiment", icon: "🧠" },
    { name: "Event Suggestions", path: "/ai/event-suggestions", icon: "🎉" }
  ];
  const userSubItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Notifications", path: "/notifications", icon: "🔔" }
  ];

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
              onClick={() => navigate("/")}
            >
              Home
            </button>
            
            {/* Resources Dropdown */}
            <div className="nav-dropdown" ref={resourcesDropdownRef}>
              <button 
                className={`navbar-link ${isActive("/resources") || isActive("/upload") || isActive("/files") ? "active" : ""}`}
                onClick={() => setIsResourcesDropdownOpen(!isResourcesDropdownOpen)}
              >
                Resources
              </button>
              
              {isResourcesDropdownOpen && (
                <div className="dropdown-menu animate-fadeIn">
                  {resourceSubItems.map((item) => (
                    <button 
                      key={item.path}
                      className={`dropdown-item ${isActive(item.path) ? "active" : ""}`}
                      onClick={() => {
                        navigate(item.path);
                        setIsResourcesDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className={`navbar-link ${isActive("/stories") ? "active" : ""}`}
              onClick={() => navigate("/stories")}
            >
              Stories
            </button>
            
            {/* Community Dropdown */}
            <div className="nav-dropdown" ref={communityDropdownRef}>
              <button 
                className={`navbar-link ${isActive("/circles") || isActive("/events") || isActive("/leaderboard") ? "active" : ""}`}
                onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
              >
                Community
              </button>
              
              {isCommunityDropdownOpen && (
                <div className="dropdown-menu animate-fadeIn">
                  {communitySubItems.map((item) => (
                    <button 
                      key={item.path}
                      className={`dropdown-item ${isActive(item.path) ? "active" : ""}`}
                      onClick={() => {
                        navigate(item.path);
                        setIsCommunityDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <SmartSearchBar />
        </div>

        {/* Right Side Items */}
        <div className="navbar-right">
          <LanguageSelector />
          <ThemeToggle />
          
          {user ? (
            <>
              <NotificationBell />
              
              {/* AI Features Dropdown */}
              <div className="nav-dropdown" ref={aiDropdownRef}>
                <button 
                  className="btn btn-icon btn-ghost ai-button"
                  onClick={() => setIsAIDropdownOpen(!isAIDropdownOpen)}
                  aria-label="AI Features"
                >
                  <span className="icon">🤖</span>
                </button>
                
                {isAIDropdownOpen && (
                  <div className="dropdown-menu dropdown-menu-wide animate-fadeIn">
                    <div className="dropdown-header">
                      <h3>AI Features</h3>
                      <p>Powered by advanced machine learning</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    {aiSubItems.map((item) => (
                      <button 
                        key={item.path}
                        className={`dropdown-item ${isActive(item.path) ? "active" : ""}`}
                        onClick={() => {
                          navigate(item.path);
                          setIsAIDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-icon">{item.icon}</span>
                        <span className="dropdown-text">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* User Dropdown */}
              <div className="nav-dropdown" ref={userDropdownRef}>
                <button 
                  className="user-avatar"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User menu"
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>
                
                {isUserDropdownOpen && (
                  <div className="dropdown-menu animate-fadeIn">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-avatar-large">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    {userSubItems.map((item) => (
                      <button 
                        key={item.path}
                        className={`dropdown-item ${isActive(item.path) ? "active" : ""}`}
                        onClick={() => {
                          navigate(item.path);
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        <span className="dropdown-icon">{item.icon}</span>
                        {item.name}
                      </button>
                    ))}
                    
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>
          )}
          
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu animate-slideInUp">
          <div className="mobile-search">
            <SmartSearchBar />
          </div>
          
          <div className="mobile-nav-groups">
            <div className="mobile-group">
              <h3 className="mobile-group-title">Main Navigation</h3>
              {mainNavItems.map((item) => (
                <button 
                  key={item.path}
                  className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
            
            {user && (
              <>
                <div className="mobile-group">
                  <h3 className="mobile-group-title">AI Features</h3>
                  {aiSubItems.map((item) => (
                    <button 
                      key={item.path}
                      className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
                
                <div className="mobile-group">
                  <h3 className="mobile-group-title">Account</h3>
                  {userSubItems.map((item) => (
                    <button 
                      key={item.path}
                      className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                  <button 
                    className="mobile-nav-item mobile-nav-item-danger"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <span className="mobile-nav-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </>
            )}
            
            {!user && (
              <div className="mobile-group mobile-auth-group">
                <button 
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Log In
                </button>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    navigate("/signup");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;