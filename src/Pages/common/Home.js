/* bookhive/src/components/Home.js */
import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../auth/AuthContext";
import { resourcesService, storiesService } from "../../services/api"; // Fixed: Import proper services instead of apiClient
import "../../styles/Home.css";
import ResourceCard from "./ResourceCard";

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trendingResources, setTrendingResources] = useState([]);
    const [latestStories, setLatestStories] = useState([]);
    const [popularCircles, setPopularCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalResources: 0,
        totalUsers: 0,
        totalDownloads: 0
    });

    // Fetch home page data
    const fetchHomeData = async () => {
        try {
            setLoading(true);
            try {
                // Fetch trending resources
                const resourcesRes = await resourcesService.getAll({ limit: 6, sort: 'rating' });
                setTrendingResources(resourcesRes.resources || []);
                
                // Fetch latest stories
                const storiesRes = await storiesService.getAll({ limit: 4 });
                setLatestStories(storiesRes.stories || []);
                
                // Fetch popular circles
                // const circlesRes = await apiClient.get('/circles/popular?limit=4');
                // setPopularCircles(circlesRes.data.circles || []);
                
                // Fetch stats
                // const statsRes = await apiClient.get('/stats/home');
                // setStats(statsRes.data);
            } catch (err) {
                console.error('Error fetching home data:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Welcome to BookHive</h1>
                        <p className="hero-subtitle">Connect, Share, and Learn with Fellow Students</p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">{stats.totalResources.toLocaleString()}</span>
                                <span className="stat-label">Resources</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{stats.totalUsers.toLocaleString()}</span>
                                <span className="stat-label">Learners</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">{stats.totalDownloads.toLocaleString()}</span>
                                <span className="stat-label">Downloads</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="hero-buttons">
                        {user ? (
                            <>
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/upload')}
                                >
                                    📤 Upload Resource
                                </button>
                                <button 
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    📊 My Dashboard
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/signup')}
                                >
                                    🚀 Get Started
                                </button>
                                <button 
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/resources')}
                                >
                                    🔍 Browse Resources
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="hero-illustration">
                    <div className="hero-image-placeholder">
                        <span className="hero-image-icon">📚</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Powerful Learning Platform</h2>
                        <p className="section-subtitle">Everything you need to enhance your learning journey</p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-card card">
                            <div className="feature-icon">📚</div>
                            <h3>Share Resources</h3>
                            <p>Upload notes, PDFs, and study materials for others. Build a collaborative learning community.</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/resources')}
                            >
                                Explore Resources
                            </button>
                        </div>
                        
                        <div className="feature-card card">
                            <div className="feature-icon">👥</div>
                            <h3>Join Communities</h3>
                            <p>Connect with study groups and discussion circles. Collaborate with peers worldwide.</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/circles')}
                            >
                                Find Circles
                            </button>
                        </div>
                        
                        <div className="feature-card card">
                            <div className="feature-icon">📖</div>
                            <h3>Read Stories</h3>
                            <p>Discover inspiring academic journeys and experiences from fellow learners.</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/stories')}
                            >
                                Read Stories
                            </button>
                        </div>
                        
                        <div className="feature-card card">
                            <div className="feature-icon">🤖</div>
                            <h3>AI Assistance</h3>
                            <p>Get personalized book recommendations, content summarization, and smart search.</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/ai/chat')}
                            >
                                Try AI Assistant
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Resources */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">🔥 Trending Resources</h2>
                            <p className="section-subtitle">Most popular learning materials this week</p>
                        </div>
                        <button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/resources')}
                        >
                            View All Resources →
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="loading-skeleton-grid">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="skeleton-card"></div>
                            ))}
                        </div>
                    ) : trendingResources.length > 0 ? (
                        <div className="resources-grid">
                            {trendingResources.slice(0, 6).map(resource => (
                                <ResourceCard key={resource._id} resource={resource} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📚</div>
                            <h3>No trending resources found</h3>
                            <p>Be the first to upload a resource and start the trend!</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/upload')}
                            >
                                Upload Resource
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Latest Stories */}
            <section className="section bg-secondary">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">📖 Latest Stories</h2>
                            <p className="section-subtitle">Inspiring journeys from our community</p>
                        </div>
                        <button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/stories')}
                        >
                            View All Stories →
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="loading-skeleton-grid">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="skeleton-card"></div>
                            ))}
                        </div>
                    ) : latestStories.length > 0 ? (
                        <div className="stories-grid">
                            {latestStories.map(story => (
                                <div key={story._id} className="story-card card">
                                    <h3 className="story-title">{story.title}</h3>
                                    <p className="story-author">by {story.author}</p>
                                    <p className="story-excerpt">{story.content.substring(0, 120)}...</p>
                                    <div className="story-meta">
                                        <span className="story-date">
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => navigate(`/stories/${story._id}`)}
                                    >
                                        Read More
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📖</div>
                            <h3>No stories published yet</h3>
                            <p>Share your learning journey with the community!</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/stories')}
                            >
                                Share Your Story
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Popular Study Circles */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">👥 Popular Study Circles</h2>
                            <p className="section-subtitle">Join active learning communities</p>
                        </div>
                        <button 
                            className="btn btn-outline" 
                            onClick={() => navigate('/circles')}
                        >
                            Browse All Circles →
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="loading-skeleton-grid">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="skeleton-card"></div>
                            ))}
                        </div>
                    ) : popularCircles.length > 0 ? (
                        <div className="circles-grid">
                            {popularCircles.map(circle => (
                                <div key={circle._id} className="circle-card card">
                                    <div className="circle-header">
                                        <h3 className="circle-title">{circle.name}</h3>
                                        <span className="circle-members">
                                            👥 {circle.memberCount || 0} members
                                        </span>
                                    </div>
                                    <p className="circle-description">{circle.description}</p>
                                    <div className="circle-tags">
                                        {circle.tags && circle.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="badge badge-secondary">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => navigate(`/circles/${circle._id}`)}
                                    >
                                        Join Circle
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">👥</div>
                            <h3>No study circles created yet</h3>
                            <p>Start your own study group and invite others!</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/circles')}
                            >
                                Create Study Circle
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section section">
                <div className="container">
                    <div className="cta-card card">
                        <div className="cta-content">
                            <h2 className="cta-title">Ready to Transform Your Learning?</h2>
                            <p className="cta-description">
                                Join thousands of students sharing resources, collaborating in study groups, 
                                and accelerating their learning journey with BookHive.
                            </p>
                            <div className="cta-buttons">
                                <button 
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/signup')}
                                >
                                    Join BookHive Free
                                </button>
                                <button 
                                    className="btn btn-outline btn-lg"
                                    onClick={() => navigate('/resources')}
                                >
                                    Explore Resources
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;