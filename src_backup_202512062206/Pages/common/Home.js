/* bookhive/src/components/Home.js */
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import ResourceCard from "./ResourceCard";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trendingResources, setTrendingResources] = useState([]);
    const [latestStories, setLatestStories] = useState([]);
    const [popularCircles, setPopularCircles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data from backend
    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                // Fetch trending resources
                const resourcesRes = await apiClient.resourcesAPI.getAll({ limit: 3, sort: 'rating' });
                setTrendingResources(resourcesRes.resources || []);

                // Fetch latest stories
                const storiesRes = await apiClient.storiesAPI.getAll({ limit: 3 });
                setLatestStories(storiesRes.stories || []);

                // Fetch popular circles
                const circlesRes = await apiClient.studyCirclesAPI.getAll({ limit: 3 });
                setPopularCircles(circlesRes.circles || []);
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to BookHive</h1>
                    <p>Connect, Share, and Learn with Fellow Students</p>
                    {user ? (
                        <div className="hero-buttons">
                            <button 
                                className="btn-hero btn-hero-primary"
                                onClick={() => navigate('/upload')}
                            >
                                Upload Resource
                            </button>
                            <button 
                                className="btn-hero btn-hero-secondary"
                                onClick={() => navigate('/leaderboard')}
                            >
                                View Leaderboard
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn-hero btn-hero-primary"
                            onClick={() => navigate('/auth')}
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon">📚</div>
                    <h3>Share Resources</h3>
                    <p>Upload notes, PDFs, and study materials for others</p>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/resources')}
                    >
                        Explore Resources
                    </button>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">👥</div>
                    <h3>Join Communities</h3>
                    <p>Connect with study groups and discussion circles</p>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/circles')}
                    >
                        Find Circles
                    </button>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">📖</div>
                    <h3>Read Stories</h3>
                    <p>Discover inspiring academic journeys and experiences</p>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/stories')}
                    >
                        Read Stories
                    </button>
                </div>
            </section>

            {/* Trending Resources */}
            <section className="section">
                <div className="section-header">
                    <h2>🔥 Trending Resources</h2>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/resources')}
                    >
                        View All →
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading">Loading trending resources...</div>
                ) : trendingResources.length > 0 ? (
                    <div className="resources-grid">
                        {trendingResources.map(resource => (
                            <ResourceCard key={resource._id} resource={resource} />
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No trending resources found.</p>
                )}
            </section>

            {/* Latest Stories */}
            <section className="section">
                <div className="section-header">
                    <h2>📖 Latest Stories</h2>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/stories')}
                    >
                        View All →
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading">Loading latest stories...</div>
                ) : latestStories.length > 0 ? (
                    <div className="stories-grid">
                        {latestStories.map(story => (
                            <div key={story._id} className="story-card">
                                <h3>{story.title}</h3>
                                <p className="story-author">by {story.author}</p>
                                <p className="story-excerpt">{story.content.substring(0, 100)}...</p>
                                <button 
                                    className="btn-small" 
                                    onClick={() => navigate(`/stories/${story._id}`)}
                                >
                                    Read More
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No stories published yet.</p>
                )}
            </section>

            {/* Popular Study Circles */}
            <section className="section">
                <div className="section-header">
                    <h2>👥 Popular Study Circles</h2>
                    <button 
                        className="btn-link" 
                        onClick={() => navigate('/circles')}
                    >
                        Join Now →
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading">Loading popular circles...</div>
                ) : popularCircles.length > 0 ? (
                    <div className="circles-grid">
                        {popularCircles.map(circle => (
                            <div key={circle._id} className="circle-card">
                                <h3>{circle.name}</h3>
                                <p className="circle-description">{circle.description}</p>
                                <div className="circle-stats">
                                    <span>👥 {circle.memberCount} members</span>
                                </div>
                                <button 
                                    className="btn-join-small" 
                                    onClick={() => navigate('/circles')}
                                >
                                    Join Circle
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No study circles created yet.</p>
                )}
            </section>
        </div>
    );
};

export default Home;
