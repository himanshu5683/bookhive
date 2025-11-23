/* bookhive/src/components/Home.js */
import React from "react";

const Home = ({ setActiveComponent }) => {
    return (
        <div className="component">
            <h1>BookHive – Open Source Learning</h1>
            <p>Discover and share notes, books, and knowledge.</p>

            <button className="btn" onClick={() => setActiveComponent("Library")}>
                Browse Library
            </button>

            <button className="btn btn-secondary" onClick={() => setActiveComponent("Upload")}>
                Upload Notes
            </button>

            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-value">120</div>
                    <div className="stat-label">Total Books</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">45</div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">28</div>
                    <div className="stat-label">Downloads Today</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">89%</div>
                    <div className="stat-label">Satisfaction Rate</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
