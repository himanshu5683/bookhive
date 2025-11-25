import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../auth/AuthContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth", { replace: true });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <div className="dashboard-greeting">
                        <h1 className="dashboard-title">Welcome, {user?.email || user?.name}</h1>
                        <p className="dashboard-subtitle">Your personal dashboard</p>
                    </div>
                    <div className="dashboard-actions">
                        <button className="dashboard-btn dashboard-btn-secondary" onClick={() => navigate('/')}>Home</button>
                        <button className="dashboard-btn dashboard-btn-primary" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className="dashboard-cards">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="dashboard-card">
                            <h3 className="card-title">Card Title #{i}</h3>
                            <p className="card-desc">Brief details and actions for this card. Useful quick stats and links related to your reading journey.</p>
                            <div className="card-actions">
                                <button className="card-action-btn action-btn-open">Open</button>
                                <button className="card-action-btn action-btn-detail">Details</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-sections">
                    <div className="section-box">
                        <h4 className="section-title">📚 Reading List</h4>
                        <p className="section-content">Your saved books and notes for later reference. Keep track of all your favorites in one place.</p>
                    </div>
                    <div className="section-box">
                        <h4 className="section-title">⚡ Recent Activity</h4>
                        <p className="section-content">Track recent uploads, shares and comments from the community. Stay connected and updated.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
