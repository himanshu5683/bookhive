/* bookhive/src/components/Home.js */
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Home.css";
import ResourceCard from "./ResourceCard";
import AuthContext from "../../auth/AuthContext";
import apiClient from "../../services/api";

const Home = ({ setActiveComponent }) => {
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
                const circlesRes = await apiClient.circlesAPI.getAll({ limit: 3, sort: 'members' });
                setPopularCircles(circlesRes.circles || []);
            } catch (err) {
                console.error('Failed to fetch home data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">📚 Welcome to BookHive</h1>
                    <p className="hero-subtitle">A platform for sharing knowledge, building communities, and growing together</p>

                    <div className="hero-cta-buttons">
                        <button
                            className="btn-hero btn-hero-primary"
                            onClick={() => setActiveComponent('Upload')}
                        >
                            📤 Share Your Notes
                        </button>
                        <button
                            className="btn-hero btn-hero-primary"
                            onClick={() => setActiveComponent('Resources')}
                        >
                            🔍 Explore Resources
                        </button>
                        <button
                            className="btn-hero btn-hero-secondary"
                            onClick={() => setActiveComponent('StudyCircles')}
                        >
                            👥 Join Study Circles
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">5K+</span>
                            <span className="stat-label">Resources</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">2K+</span>
                            <span className="stat-label">Community Members</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">150+</span>
                            <span className="stat-label">Study Circles</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trending Section */}
            <section className="section trending-section">
                <div className="section-header">
                    <h2>🔥 Trending Resources</h2>
                    <button className="btn-link" onClick={() => setActiveComponent('Resources')}>View All →</button>
                </div>

                <div className="resources-grid">
                    {loading ? (
                        <p>Loading resources...</p>
                    ) : trendingResources.length > 0 ? (
                        trendingResources.map(resource => (
                            <ResourceCard key={resource._id || resource.id} resource={resource} />
                        ))
                    ) : (
                        <p>No resources yet. Be the first to share!</p>
                    )}
                </div>
            </section>

            {/* Stories Section */}
            <section className="section stories-section">
                <div className="section-header">
                    <h2>📖 Latest Stories</h2>
                    <button className="btn-link" onClick={() => setActiveComponent('Stories')}>View All →</button>
                </div>

                <div className="stories-preview">
                    {loading ? (
                        <p>Loading stories...</p>
                    ) : latestStories.length > 0 ? (
                        latestStories.map(story => (
                            <div key={story._id || story.id} className="story-preview-card">
                                <div className="story-author-mini">
                                    <span className="avatar">{(story.author || 'A').charAt(0)}</span>
                                    <div>
                                        <p className="author-name">{story.author || 'Anonymous'}</p>
                                        <p className="timestamp">Recently</p>
                                    </div>
                                </div>
                                <p className="story-text">{(story.content || '').substring(0, 100)}...</p>
                                <div className="story-engagement">
                                    <span>❤️ {story.likes || 0}</span>
                                    <span>💬 {story.comments?.length || 0}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No stories yet. Share yours!</p>
                    )}
                </div>
            </section>

            {/* Study Circles Section */}
            <section className="section circles-section">
                <div className="section-header">
                    <h2>👥 Popular Study Circles</h2>
                    <button className="btn-link" onClick={() => setActiveComponent('StudyCircles')}>Join Now →</button>
                </div>

                <div className="circles-preview">
                    {loading ? (
                        <p>Loading circles...</p>
                    ) : popularCircles.length > 0 ? (
                        popularCircles.map(circle => (
                            <div key={circle._id || circle.id} className="circle-preview-card">
                                <h3>{circle.name}</h3>
                                <p className="circle-topic">{circle.topic}</p>
                                <p className="circle-desc">{circle.description}</p>
                                <div className="circle-preview-stats">
                                    <span>👥 {circle.memberCount || circle.members?.length || 0}</span>
                                    <span>💬 {circle.threads?.length || 0}</span>
                                </div>
                                <button className="btn-join-small" onClick={() => setActiveComponent('StudyCircles')}>
                                    Join Circle
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No study circles yet. Create one!</p>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="cta-content">
                    <h2>Ready to Share Your Knowledge?</h2>
                    <p>Earn credits, build your reputation, and help the community grow by sharing your resources.</p>
                    <button
                        className="btn-hero btn-hero-primary"
                        onClick={() => user ? setActiveComponent('Upload') : navigate('/auth')}
                    >
                        {user ? '📤 Upload Now' : '🔑 Sign Up to Share'}
                    </button>
                </div>
            </section>

            {/* Gamification Preview */}
            <section className="section gamification-section">
                <h2>🎮 Gamification & Rewards</h2>
                <div className="gamification-preview">
                    <div className="gamification-card">
                        <span className="icon">⭐</span>
                        <p><strong>Earn Credits</strong> by sharing notes, PDFs, and stories.</p>
                    </div>
                    <div className="gamification-card">
                        <span className="icon">📈</span>
                        <p><strong>Climb Ranks</strong> from Contributor to Expert to Master.</p>
                    </div>
                    <div className="gamification-card">
                        <span className="icon">🏆</span>
                        <p><strong>Earn Badges</strong> for achievements and milestones.</p>
                    </div>
                    <div className="gamification-card">
                        <span className="icon">👑</span>
                        <p><strong>Join Leaderboard</strong> and compete with top contributors.</p>
                    </div>
                </div>
                <div className="leaderboard-btn-wrapper">
                    <button className="btn-hero btn-hero-secondary" onClick={() => setActiveComponent('Leaderboard')}>
                        🏆 View Leaderboard
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;
