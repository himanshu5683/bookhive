/* bookhive/src/components/Home.js */
import React from "react";
import "../styles/Home.css";
const stats = [
    { id: 1, label: "Total Books", value: 120 },
    { id: 2, label: "Active Users", value: 45 },
    { id: 3, label: "Downloads Today", value: 28 },
    { id: 4, label: "Satisfaction Rate", value: "89%" },
];

const collections = [
    { id: 1, title: "Science & Technology", desc: "Discover cutting-edge research and tech insights." },
    { id: 2, title: "Literature Classics", desc: "Timeless stories and masterpieces from great authors." },
    { id: 3, title: "Self-Improvement", desc: "Learn and grow with personal development guides." },
    { id: 4, title: "History & Culture", desc: "Explore fascinating historical narratives and cultures." },
    { id: 5, title: "Business & Finance", desc: "Master business strategies and financial principles." },
    { id: 6, title: "Art & Design", desc: "Inspire your creativity with artistic explorations." },
];

const Home = ({ setActiveComponent }) => {
    return (
        <div className="home-container">
            <div className="home-wrapper">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Discover, Share, Read</h1>
                        <p className="hero-desc">BookHive is a minimal, community-driven place to discover books, notes, and learning resources. Join the community and explore curated collections of knowledge shared by passionate readers.</p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => setActiveComponent("Library")}>Browse Library</button>
                            <button className="btn-secondary" onClick={() => setActiveComponent("Upload")}>Upload Notes</button>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <h3 className="stats-title">Quick Stats</h3>
                        <div className="stats-grid">
                            {stats.map(s => (
                                <div key={s.id} className="stat-item">
                                    <div className="stat-value">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="collections-section">
                    <h2 className="collections-title">Featured Collections</h2>
                    <div className="collections-grid">
                        {collections.map(c => (
                            <article key={c.id} className="collection-card">
                                <h3 className="collection-title">{c.title}</h3>
                                <p className="collection-desc">{c.desc}</p>
                                <div className="collection-actions">
                                    <button className="collection-action-btn action-btn-main" onClick={() => setActiveComponent("Library")}>Explore</button>
                                    <button className="collection-action-btn action-btn-secondary" onClick={() => setActiveComponent("Profile")}>Save</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
