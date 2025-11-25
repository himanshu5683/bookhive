/* bookhive/src/components/Home.js */
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { sampleNotes, sampleStories, sampleStudyCircles } from "../data/sampleData";
import ResourceCard from "./ResourceCard";
import AuthContext from "../auth/AuthContext";

const Home = ({ setActiveComponent }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const trendingNotes = sampleNotes.slice(0, 3);
    const latestStories = sampleStories.slice(0, 3);
    const popularCircles = sampleStudyCircles.slice(0, 3);

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
                    {trendingNotes.map(note => (
                        <ResourceCard key={note.id} resource={{ ...note, type: 'note' }} />
                    ))}
                </div>
            </section>

            {/* Stories Section */}
            <section className="section stories-section">
                <div className="section-header">
                    <h2>📖 Latest Stories</h2>
                    <button className="btn-link" onClick={() => setActiveComponent('Stories')}>View All →</button>
                </div>

                <div className="stories-preview">
                    {latestStories.map(story => (
                        <div key={story.id} className="story-preview-card">
                            <div className="story-author-mini">
                                <span className="avatar">{story.author.charAt(0)}</span>
                                <div>
                                    <p className="author-name">{story.author}</p>
                                    <p className="timestamp">2h ago</p>
                                </div>
                            </div>
                            <p className="story-text">{story.content.substring(0, 100)}...</p>
                            <div className="story-engagement">
                                <span>❤️ {story.likes}</span>
                                <span>💬 {story.comments}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Study Circles Section */}
            <section className="section circles-section">
                <div className="section-header">
                    <h2>👥 Popular Study Circles</h2>
                    <button className="btn-link" onClick={() => setActiveComponent('StudyCircles')}>Join Now →</button>
                </div>

                <div className="circles-preview">
                    {popularCircles.map(circle => (
                        <div key={circle.id} className="circle-preview-card">
                            <div className="circle-emoji-large">{circle.emoji}</div>
                            <h3>{circle.name}</h3>
                            <p className="circle-topic">{circle.topic}</p>
                            <p className="circle-desc">{circle.description}</p>
                            <div className="circle-preview-stats">
                                <span>👥 {circle.members}</span>
                                <span>💬 {circle.threads}</span>
                            </div>
                            <button className="btn-join-small" onClick={() => setActiveComponent('StudyCircles')}>
                                Join Circle
                            </button>
                        </div>
                    ))}
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
